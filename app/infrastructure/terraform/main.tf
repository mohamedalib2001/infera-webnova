# INFERA WebNova - Hetzner Cloud Infrastructure
# Terraform configuration for sovereign platform deployment

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
  
  backend "local" {
    path = "terraform.tfstate"
  }
}

# Provider configuration - uses HCLOUD_TOKEN environment variable
provider "hcloud" {
  token = var.hcloud_token
}

# ==================== VARIABLES ====================

variable "hcloud_token" {
  description = "Hetzner Cloud API Token"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "region" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "fsn1"
  
  validation {
    condition     = contains(["fsn1", "nbg1", "hel1", "ash", "hil"], var.region)
    error_message = "Region must be a valid Hetzner datacenter."
  }
}

variable "server_type" {
  description = "Server type for nodes"
  type        = string
  default     = "cx21"
}

variable "master_count" {
  description = "Number of k3s master nodes"
  type        = number
  default     = 1
}

variable "worker_count" {
  description = "Number of k3s worker nodes"
  type        = number
  default     = 2
}

variable "ssh_public_key" {
  description = "SSH public key for server access"
  type        = string
}

variable "domain" {
  description = "Base domain for the platform"
  type        = string
  default     = "infera.app"
}

# ==================== NETWORK ====================

resource "hcloud_network" "infera_network" {
  name     = "infera-${var.environment}-network"
  ip_range = "10.0.0.0/16"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    platform    = "infera-webnova"
  }
}

resource "hcloud_network_subnet" "infera_subnet" {
  network_id   = hcloud_network.infera_network.id
  type         = "cloud"
  network_zone = "eu-central"
  ip_range     = "10.0.1.0/24"
}

# ==================== SSH KEY ====================

resource "hcloud_ssh_key" "infera_key" {
  name       = "infera-${var.environment}-key"
  public_key = var.ssh_public_key
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ==================== FIREWALL ====================

resource "hcloud_firewall" "infera_firewall" {
  name = "infera-${var.environment}-firewall"
  
  # SSH access
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  
  # HTTP
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  
  # HTTPS
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  
  # Kubernetes API
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "6443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  
  # NodePort range
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "30000-32767"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ==================== MASTER NODES ====================

resource "hcloud_server" "k3s_master" {
  count       = var.master_count
  name        = "infera-${var.environment}-master-${count.index + 1}"
  server_type = var.server_type
  image       = "ubuntu-22.04"
  location    = var.region
  ssh_keys    = [hcloud_ssh_key.infera_key.id]
  
  firewall_ids = [hcloud_firewall.infera_firewall.id]
  
  network {
    network_id = hcloud_network.infera_network.id
    ip         = "10.0.1.${10 + count.index}"
  }
  
  user_data = templatefile("${path.module}/cloud-init/master.yaml", {
    node_name   = "master-${count.index + 1}"
    environment = var.environment
    is_first    = count.index == 0
  })
  
  labels = {
    role        = "master"
    environment = var.environment
    managed_by  = "terraform"
    platform    = "infera-webnova"
  }
  
  depends_on = [hcloud_network_subnet.infera_subnet]
}

# ==================== WORKER NODES ====================

resource "hcloud_server" "k3s_worker" {
  count       = var.worker_count
  name        = "infera-${var.environment}-worker-${count.index + 1}"
  server_type = var.server_type
  image       = "ubuntu-22.04"
  location    = var.region
  ssh_keys    = [hcloud_ssh_key.infera_key.id]
  
  firewall_ids = [hcloud_firewall.infera_firewall.id]
  
  network {
    network_id = hcloud_network.infera_network.id
    ip         = "10.0.1.${20 + count.index}"
  }
  
  user_data = templatefile("${path.module}/cloud-init/worker.yaml", {
    node_name    = "worker-${count.index + 1}"
    environment  = var.environment
    master_ip    = hcloud_server.k3s_master[0].ipv4_address
  })
  
  labels = {
    role        = "worker"
    environment = var.environment
    managed_by  = "terraform"
    platform    = "infera-webnova"
  }
  
  depends_on = [hcloud_server.k3s_master]
}

# ==================== LOAD BALANCER ====================

resource "hcloud_load_balancer" "infera_lb" {
  name               = "infera-${var.environment}-lb"
  load_balancer_type = "lb11"
  location           = var.region
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    platform    = "infera-webnova"
  }
}

resource "hcloud_load_balancer_network" "infera_lb_network" {
  load_balancer_id = hcloud_load_balancer.infera_lb.id
  network_id       = hcloud_network.infera_network.id
  ip               = "10.0.1.100"
}

resource "hcloud_load_balancer_target" "infera_lb_targets" {
  count            = var.worker_count
  type             = "server"
  load_balancer_id = hcloud_load_balancer.infera_lb.id
  server_id        = hcloud_server.k3s_worker[count.index].id
  use_private_ip   = true
  
  depends_on = [hcloud_load_balancer_network.infera_lb_network]
}

resource "hcloud_load_balancer_service" "http" {
  load_balancer_id = hcloud_load_balancer.infera_lb.id
  protocol         = "http"
  listen_port      = 80
  destination_port = 80
  
  health_check {
    protocol = "http"
    port     = 80
    interval = 15
    timeout  = 10
    retries  = 3
    http {
      path         = "/health"
      status_codes = ["2??", "3??"]
    }
  }
}

resource "hcloud_load_balancer_service" "https" {
  load_balancer_id = hcloud_load_balancer.infera_lb.id
  protocol         = "https"
  listen_port      = 443
  destination_port = 443
  
  health_check {
    protocol = "https"
    port     = 443
    interval = 15
    timeout  = 10
    retries  = 3
    http {
      path         = "/health"
      status_codes = ["2??", "3??"]
    }
  }
}

# ==================== VOLUMES ====================

resource "hcloud_volume" "data_volume" {
  count    = var.worker_count
  name     = "infera-${var.environment}-data-${count.index + 1}"
  size     = 50
  location = var.region
  format   = "ext4"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    platform    = "infera-webnova"
  }
}

resource "hcloud_volume_attachment" "data_attachment" {
  count     = var.worker_count
  volume_id = hcloud_volume.data_volume[count.index].id
  server_id = hcloud_server.k3s_worker[count.index].id
  automount = true
}

# ==================== OUTPUTS ====================

output "master_ips" {
  description = "Public IPs of master nodes"
  value       = hcloud_server.k3s_master[*].ipv4_address
}

output "worker_ips" {
  description = "Public IPs of worker nodes"
  value       = hcloud_server.k3s_worker[*].ipv4_address
}

output "load_balancer_ip" {
  description = "Public IP of the load balancer"
  value       = hcloud_load_balancer.infera_lb.ipv4
}

output "network_id" {
  description = "ID of the private network"
  value       = hcloud_network.infera_network.id
}

output "cluster_info" {
  description = "Cluster configuration summary"
  value = {
    environment     = var.environment
    region          = var.region
    master_count    = var.master_count
    worker_count    = var.worker_count
    load_balancer   = hcloud_load_balancer.infera_lb.ipv4
  }
}
