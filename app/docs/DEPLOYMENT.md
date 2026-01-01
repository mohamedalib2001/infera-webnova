# INFERA WebNova Deployment Guide
دليل نشر INFERA WebNova

## Prerequisites / المتطلبات

### Required Tools
- Terraform >= 1.0
- Ansible >= 2.12
- kubectl >= 1.28
- Helm >= 3.12

### Cloud Credentials
- Hetzner API Token
- SSH Key Pair

---

## Infrastructure Deployment / نشر البنية التحتية

### 1. Configure Terraform Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
hcloud_token     = "your-hetzner-api-token"
ssh_public_key   = "ssh-rsa AAAA..."
environment      = "production"
region           = "nbg1"           # Nuremberg
master_count     = 1                # 1-3 for HA
worker_count     = 2                # Scale as needed
server_type      = "cpx21"          # 3 vCPU, 4GB RAM
domain           = "your-domain.com"
```

### 2. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply
```

#### Resources Created
| Resource | Type | Purpose |
|----------|------|---------|
| VPC Network | 10.0.0.0/16 | Private network |
| Subnet | 10.0.1.0/24 | Node subnet |
| Firewall | SSH, HTTP, HTTPS, k3s | Network security |
| Master Nodes | 1-3 × cpx21 | k3s control plane |
| Worker Nodes | N × cpx21 | Application workload |
| Load Balancer | lb11 | Traffic distribution |
| Volumes | 50GB per worker | Persistent storage |

### 3. Configure Ansible Inventory

```bash
cd ../ansible
cp inventory/hosts.yml.example inventory/hosts.yml
```

Edit `inventory/hosts.yml`:
```yaml
all:
  children:
    masters:
      hosts:
        master-1:
          ansible_host: <master-1-ip>
    workers:
      hosts:
        worker-1:
          ansible_host: <worker-1-ip>
        worker-2:
          ansible_host: <worker-2-ip>
  vars:
    ansible_user: root
    ansible_ssh_private_key_file: ~/.ssh/id_rsa
```

### 4. Run Ansible Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-k3s.yml
```

#### Playbook Tasks
1. System security hardening (UFW, fail2ban)
2. k3s master installation
3. k3s worker join
4. Helm installation
5. Core components:
   - cert-manager (TLS certificates)
   - ingress-nginx (Ingress controller)
   - Longhorn (Distributed storage)
6. INFERA namespace creation

### 5. Verify Cluster

```bash
# Copy kubeconfig from master
scp root@<master-ip>:/etc/rancher/k3s/k3s.yaml ~/.kube/config

# Update server address
sed -i 's/127.0.0.1/<master-ip>/g' ~/.kube/config

# Verify nodes
kubectl get nodes

# Verify components
kubectl get pods -n kube-system
kubectl get pods -n cert-manager
kubectl get pods -n ingress-nginx
kubectl get pods -n longhorn-system
```

---

## Application Deployment / نشر التطبيق

### 1. Build Docker Image

```bash
# Build application image (update tag as needed)
docker build -t your-registry/infera-webnova:v1.0.0 .

# Push to your container registry
docker push your-registry/infera-webnova:v1.0.0

# Update deployment.yaml with your image
# Change: image: infera/webnova:latest
# To:     image: your-registry/infera-webnova:v1.0.0
```

### 2. Configure Secrets

Refer to `infrastructure/k3s/secrets.yaml` for the secrets management guide.

**Option A: Direct Secret Creation (Development)**
```bash
kubectl create secret generic infera-secrets \
  --namespace=infera \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --from-literal=SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=SERVICE_AUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=ANTHROPIC_API_KEY="your-key" \
  --from-literal=HETZNER_API_TOKEN="your-token"
```

**Option B: External Secrets Operator (Production)**
See `infrastructure/k3s/secrets.yaml` for integration with:
- SOPS (Mozilla)
- Sealed Secrets (Bitnami)
- External Secrets Operator

### 3. Deploy Application

```bash
cd infrastructure/k3s

# Apply namespace
kubectl apply -f namespace.yaml

# Apply storage
kubectl apply -f storage.yaml

# Apply deployment + service + HPA
kubectl apply -f deployment.yaml

# Apply ingress
kubectl apply -f ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n infera

# Check services
kubectl get svc -n infera

# Check ingress
kubectl get ingress -n infera

# Check HPA
kubectl get hpa -n infera

# View logs
kubectl logs -n infera -l app=infera-webnova -f
```

---

## SSL/TLS Configuration / إعداد الشهادات

### Let's Encrypt (Production)

The ingress is configured with cert-manager annotations:
```yaml
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

Verify certificate:
```bash
kubectl get certificate -n infera
kubectl describe certificate infera-tls -n infera
```

### Custom Certificate

```bash
kubectl create secret tls infera-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n infera
```

---

## Scaling / التوسع

### Horizontal Pod Autoscaler (HPA)

Configured for 3-10 replicas based on:
- CPU utilization > 70%
- Memory utilization > 80%

Manual scaling:
```bash
# Scale deployment
kubectl scale deployment infera-webnova -n infera --replicas=5

# View HPA status
kubectl get hpa -n infera -w
```

### Add Worker Nodes

1. Update Terraform:
```hcl
worker_count = 4  # Increase from 2
```

2. Apply changes:
```bash
cd infrastructure/terraform
terraform apply
```

3. Update Ansible inventory and re-run playbook

---

## Monitoring / المراقبة

### Prometheus Metrics

Application exposes metrics on port 9090:
```
/metrics - Prometheus format metrics
```

### Health Endpoints

```
GET /health - Liveness probe
GET /ready  - Readiness probe
```

### Logging

View application logs:
```bash
kubectl logs -n infera -l app=infera-webnova -f --tail=100
```

Aggregate logs (if configured):
```bash
kubectl logs -n infera -l app=infera-webnova --all-containers=true
```

---

## Backup & Recovery / النسخ الاحتياطي والاسترداد

### Database Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup-20241223.sql
```

### Volume Backup (Longhorn)

```bash
# Create volume snapshot
kubectl apply -f - <<EOF
apiVersion: longhorn.io/v1beta1
kind: Snapshot
metadata:
  name: infera-data-snapshot-$(date +%Y%m%d)
  namespace: longhorn-system
spec:
  volume: infera-data-pvc
EOF
```

### Disaster Recovery

1. Backup database daily
2. Snapshot volumes weekly
3. Export Kubernetes resources:
```bash
kubectl get all,cm,secret,ingress,pvc -n infera -o yaml > infera-backup.yaml
```

---

## Rollback / التراجع

### Application Rollback

```bash
# View revision history
kubectl rollout history deployment/infera-webnova -n infera

# Rollback to previous revision
kubectl rollout undo deployment/infera-webnova -n infera

# Rollback to specific revision
kubectl rollout undo deployment/infera-webnova -n infera --to-revision=2
```

### Infrastructure Rollback

```bash
# View Terraform state history
terraform state list

# Rollback infrastructure (manual process)
# 1. Identify target state
# 2. Update terraform.tfvars
# 3. terraform apply
```

---

## Troubleshooting / استكشاف الأخطاء

### Common Issues

#### Pods Not Starting
```bash
kubectl describe pod <pod-name> -n infera
kubectl logs <pod-name> -n infera --previous
```

#### Ingress Not Working
```bash
kubectl describe ingress infera-ingress -n infera
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

#### Certificate Issues
```bash
kubectl describe certificate infera-tls -n infera
kubectl logs -n cert-manager -l app=cert-manager
```

#### Database Connection
```bash
kubectl exec -it <pod-name> -n infera -- sh
# Inside pod:
nc -zv $PGHOST $PGPORT
```

### Debug Pod
```bash
kubectl run debug --rm -i --tty --image=alpine -n infera -- sh
# Inside debug pod:
apk add postgresql-client curl
psql $DATABASE_URL -c "SELECT 1"
curl http://infera-webnova/health
```

---

## Security Checklist / قائمة الأمان

- [ ] Change default SSH port
- [ ] Disable root SSH login (use sudo user)
- [ ] Configure fail2ban thresholds
- [ ] Enable network policies
- [ ] Configure pod security policies
- [ ] Rotate secrets regularly
- [ ] Enable audit logging
- [ ] Configure backup encryption
- [ ] Set up alerting for security events
- [ ] Review firewall rules periodically

---

## Environment Variables / متغيرات البيئة

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://... |
| SESSION_SECRET | Session encryption | random-32-chars |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| SERVICE_AUTH_SECRET | Service auth key | SESSION_SECRET |
| ANTHROPIC_API_KEY | Claude AI key | - |
| HETZNER_API_TOKEN | Hetzner API | - |
| NODE_ENV | Environment | production |
| PORT | Application port | 5000 |

---

## Maintenance Windows / نوافذ الصيانة

Recommended maintenance schedule:
- **Weekly**: Security patches, minor updates
- **Monthly**: Kubernetes upgrades, dependency updates
- **Quarterly**: Major version upgrades, security audits

### Maintenance Mode

```bash
# Enable maintenance mode
kubectl scale deployment infera-webnova -n infera --replicas=0

# Perform maintenance...

# Disable maintenance mode
kubectl scale deployment infera-webnova -n infera --replicas=3
```

---

*INFERA WebNova - Sovereign Digital Platform Operating System*
