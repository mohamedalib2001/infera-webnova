import {
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Message,
  type InsertMessage,
  type Template,
  type InsertTemplate,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Messages
  getMessagesByProject(projectId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private messages: Map<string, Message>;
  private templates: Map<string, Template>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.messages = new Map();
    this.templates = new Map();
    
    // Initialize with sample templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const sampleTemplates: InsertTemplate[] = [
      {
        name: "Modern Landing Page",
        description: "A clean, modern landing page with hero section and features",
        category: "Landing",
        htmlCode: `<div class="landing">
  <header class="header">
    <nav class="nav">
      <div class="logo">Brand</div>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main class="hero">
    <h1>Build Something Amazing</h1>
    <p>Create beautiful websites with our powerful platform</p>
    <button class="cta-button">Get Started</button>
  </main>
  <section class="features" id="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>Fast</h3>
        <p>Lightning-fast performance</p>
      </div>
      <div class="feature-card">
        <h3>Secure</h3>
        <p>Enterprise-grade security</p>
      </div>
      <div class="feature-card">
        <h3>Scalable</h3>
        <p>Grow without limits</p>
      </div>
    </div>
  </section>
</div>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; }
.landing { min-height: 100vh; }
.header { padding: 1rem 2rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
.logo { font-size: 1.5rem; font-weight: bold; color: #6366f1; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { text-decoration: none; color: #374151; }
.hero { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
.hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { padding: 1rem 2.5rem; font-size: 1.1rem; background: white; color: #6366f1; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.features { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.features h2 { font-size: 2.5rem; margin-bottom: 3rem; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
.feature-card { padding: 2rem; background: #f9fafb; border-radius: 12px; }
.feature-card h3 { color: #6366f1; margin-bottom: 0.5rem; }`,
        jsCode: `document.querySelector('.cta-button').addEventListener('click', () => {
  alert('Welcome! Let\\'s get started.');
});`,
        thumbnail: null,
      },
      {
        name: "Portfolio",
        description: "Personal portfolio with project showcase",
        category: "Portfolio",
        htmlCode: `<div class="portfolio">
  <header class="portfolio-header">
    <h1>John Doe</h1>
    <p>Full Stack Developer</p>
  </header>
  <section class="about">
    <h2>About Me</h2>
    <p>I'm a passionate developer creating amazing digital experiences.</p>
  </section>
  <section class="projects">
    <h2>My Projects</h2>
    <div class="project-grid">
      <div class="project-card">
        <div class="project-image"></div>
        <h3>Project One</h3>
        <p>A modern web application</p>
      </div>
      <div class="project-card">
        <div class="project-image"></div>
        <h3>Project Two</h3>
        <p>Mobile-first design</p>
      </div>
    </div>
  </section>
  <footer class="contact">
    <h2>Get In Touch</h2>
    <a href="mailto:hello@example.com">hello@example.com</a>
  </footer>
</div>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0f172a; color: white; }
.portfolio { max-width: 1000px; margin: 0 auto; padding: 4rem 2rem; }
.portfolio-header { text-align: center; margin-bottom: 4rem; }
.portfolio-header h1 { font-size: 3rem; margin-bottom: 0.5rem; background: linear-gradient(90deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.portfolio-header p { color: #94a3b8; font-size: 1.25rem; }
section { margin-bottom: 4rem; }
h2 { font-size: 2rem; margin-bottom: 1.5rem; }
.about p { color: #94a3b8; font-size: 1.1rem; line-height: 1.8; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.project-card { background: #1e293b; border-radius: 12px; overflow: hidden; }
.project-image { height: 200px; background: linear-gradient(135deg, #a855f7, #ec4899); }
.project-card h3, .project-card p { padding: 0 1.5rem; }
.project-card h3 { padding-top: 1.5rem; margin-bottom: 0.5rem; }
.project-card p { color: #94a3b8; padding-bottom: 1.5rem; }
.contact { text-align: center; }
.contact a { color: #a855f7; font-size: 1.25rem; }`,
        jsCode: `// Add smooth scrolling and animations
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.transition = 'transform 0.3s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
});`,
        thumbnail: null,
      },
      {
        name: "E-commerce Product",
        description: "Product showcase page with cart functionality",
        category: "E-commerce",
        htmlCode: `<div class="product-page">
  <nav class="shop-nav">
    <div class="brand">ShopName</div>
    <div class="cart-icon">Cart (0)</div>
  </nav>
  <main class="product-container">
    <div class="product-image">
      <div class="image-placeholder"></div>
    </div>
    <div class="product-info">
      <span class="category">Electronics</span>
      <h1>Premium Wireless Headphones</h1>
      <div class="rating">4.8 (120 reviews)</div>
      <p class="price">$299.99</p>
      <p class="description">Experience crystal-clear audio with our premium wireless headphones. Features active noise cancellation and 30-hour battery life.</p>
      <div class="actions">
        <button class="add-to-cart">Add to Cart</button>
        <button class="buy-now">Buy Now</button>
      </div>
    </div>
  </main>
</div>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #f8fafc; }
.shop-nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; }
.brand { font-size: 1.5rem; font-weight: bold; }
.cart-icon { cursor: pointer; }
.product-container { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; max-width: 1200px; margin: 3rem auto; padding: 2rem; }
.product-image { background: white; border-radius: 16px; padding: 2rem; }
.image-placeholder { aspect-ratio: 1; background: linear-gradient(135deg, #e0e7ff, #c7d2fe); border-radius: 12px; }
.product-info { display: flex; flex-direction: column; gap: 1rem; }
.category { color: #6366f1; font-weight: 500; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em; }
h1 { font-size: 2.5rem; color: #0f172a; }
.rating { color: #64748b; }
.price { font-size: 2rem; font-weight: bold; color: #0f172a; }
.description { color: #64748b; line-height: 1.7; }
.actions { display: flex; gap: 1rem; margin-top: 1rem; }
.add-to-cart, .buy-now { padding: 1rem 2rem; font-size: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.add-to-cart { background: white; border: 2px solid #6366f1; color: #6366f1; }
.buy-now { background: #6366f1; border: none; color: white; }
@media (max-width: 768px) { .product-container { grid-template-columns: 1fr; } }`,
        jsCode: `let cartCount = 0;
document.querySelector('.add-to-cart').addEventListener('click', () => {
  cartCount++;
  document.querySelector('.cart-icon').textContent = 'Cart (' + cartCount + ')';
  alert('Added to cart!');
});
document.querySelector('.buy-now').addEventListener('click', () => {
  alert('Proceeding to checkout...');
});`,
        thumbnail: null,
      },
    ];

    sampleTemplates.forEach((template) => {
      const id = randomUUID();
      this.templates.set(id, {
        id,
        ...template,
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description ?? null,
      htmlCode: insertProject.htmlCode ?? "",
      cssCode: insertProject.cssCode ?? "",
      jsCode: insertProject.jsCode ?? "",
      thumbnail: insertProject.thumbnail ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(
    id: string,
    updates: Partial<InsertProject>
  ): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Message methods
  async getMessagesByProject(projectId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      projectId: insertMessage.projectId,
      role: insertMessage.role,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      id,
      ...insertTemplate,
    };
    this.templates.set(id, template);
    return template;
  }
}

export const storage = new MemStorage();
