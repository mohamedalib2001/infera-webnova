import {
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Message,
  type InsertMessage,
  type Template,
  type InsertTemplate,
  type ProjectVersion,
  type InsertProjectVersion,
  type ShareLink,
  type InsertShareLink,
  type Component,
  type InsertComponent,
  users,
  projects,
  messages,
  templates,
  projectVersions,
  shareLinks,
  components,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
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

  // Project Versions
  getProjectVersions(projectId: string): Promise<ProjectVersion[]>;
  getProjectVersion(id: string): Promise<ProjectVersion | undefined>;
  createProjectVersion(version: InsertProjectVersion): Promise<ProjectVersion>;

  // Share Links
  getShareLink(shareCode: string): Promise<ShareLink | undefined>;
  getShareLinksByProject(projectId: string): Promise<ShareLink[]>;
  createShareLink(link: InsertShareLink): Promise<ShareLink>;
  deactivateShareLink(id: string): Promise<boolean>;

  // Components
  getComponents(): Promise<Component[]>;
  getComponentsByCategory(category: string): Promise<Component[]>;
  getComponent(id: string): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize sample templates
    this.initializeTemplates();
    // Initialize sample components
    this.initializeComponents();
  }

  private async initializeTemplates() {
    const existingTemplates = await db.select().from(templates);
    if (existingTemplates.length > 0) return;

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
        jsCode: `document.querySelectorAll('.project-card').forEach(card => {
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
      <p class="description">Experience crystal-clear audio with our premium wireless headphones.</p>
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
.category { color: #6366f1; font-weight: 500; text-transform: uppercase; font-size: 0.875rem; }
h1 { font-size: 2.5rem; color: #0f172a; }
.rating { color: #64748b; }
.price { font-size: 2rem; font-weight: bold; color: #0f172a; }
.description { color: #64748b; line-height: 1.7; }
.actions { display: flex; gap: 1rem; margin-top: 1rem; }
.add-to-cart, .buy-now { padding: 1rem 2rem; font-size: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.add-to-cart { background: white; border: 2px solid #6366f1; color: #6366f1; }
.buy-now { background: #6366f1; border: none; color: white; }`,
        jsCode: `let cartCount = 0;
document.querySelector('.add-to-cart').addEventListener('click', () => {
  cartCount++;
  document.querySelector('.cart-icon').textContent = 'Cart (' + cartCount + ')';
});`,
        thumbnail: null,
      },
    ];

    for (const template of sampleTemplates) {
      await db.insert(templates).values(template);
    }
  }

  private async initializeComponents() {
    const existingComponents = await db.select().from(components);
    if (existingComponents.length > 0) return;

    const sampleComponents: InsertComponent[] = [
      {
        name: "Primary Button",
        category: "Buttons",
        htmlCode: `<button class="btn-primary">Click Me</button>`,
        cssCode: `.btn-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
.btn-primary:hover { transform: translateY(-2px); }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Outline Button",
        category: "Buttons",
        htmlCode: `<button class="btn-outline">Learn More</button>`,
        cssCode: `.btn-outline { padding: 0.75rem 1.5rem; background: transparent; color: #6366f1; border: 2px solid #6366f1; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: #6366f1; color: white; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Card with Image",
        category: "Cards",
        htmlCode: `<div class="card">
  <div class="card-image"></div>
  <div class="card-content">
    <h3 class="card-title">Card Title</h3>
    <p class="card-text">This is a description of the card content.</p>
  </div>
</div>`,
        cssCode: `.card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.card-image { height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.card-content { padding: 1.5rem; }
.card-title { font-size: 1.25rem; margin-bottom: 0.5rem; color: #1f2937; }
.card-text { color: #6b7280; line-height: 1.6; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Contact Form",
        category: "Forms",
        htmlCode: `<form class="contact-form">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" placeholder="Your name" />
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" placeholder="your@email.com" />
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" rows="4" placeholder="Your message..."></textarea>
  </div>
  <button type="submit" class="submit-btn">Send Message</button>
</form>`,
        cssCode: `.contact-form { max-width: 400px; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
.form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.submit-btn { width: 100%; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Navigation Bar",
        category: "Navigation",
        htmlCode: `<nav class="navbar">
  <div class="nav-brand">Brand</div>
  <ul class="nav-menu">
    <li><a href="#" class="nav-link">Home</a></li>
    <li><a href="#" class="nav-link">About</a></li>
    <li><a href="#" class="nav-link">Services</a></li>
    <li><a href="#" class="nav-link">Contact</a></li>
  </ul>
</nav>`,
        cssCode: `.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.nav-brand { font-size: 1.5rem; font-weight: bold; color: #6366f1; }
.nav-menu { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
.nav-link { text-decoration: none; color: #374151; font-weight: 500; transition: color 0.2s; }
.nav-link:hover { color: #6366f1; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Hero Section",
        category: "Sections",
        htmlCode: `<section class="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">Welcome to Our Platform</h1>
    <p class="hero-subtitle">Build amazing things with our powerful tools</p>
    <div class="hero-buttons">
      <button class="btn-hero-primary">Get Started</button>
      <button class="btn-hero-secondary">Learn More</button>
    </div>
  </div>
</section>`,
        cssCode: `.hero-section { min-height: 80vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 2rem; }
.hero-title { font-size: 3.5rem; margin-bottom: 1rem; }
.hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
.hero-buttons { display: flex; gap: 1rem; justify-content: center; }
.btn-hero-primary { padding: 1rem 2rem; background: white; color: #6366f1; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-hero-secondary { padding: 1rem 2rem; background: transparent; color: white; border: 2px solid white; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Footer",
        category: "Sections",
        htmlCode: `<footer class="site-footer">
  <div class="footer-content">
    <div class="footer-section">
      <h4>Company</h4>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Careers</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>
    <div class="footer-section">
      <h4>Resources</h4>
      <ul>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Docs</a></li>
        <li><a href="#">Help</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>2024 Company. All rights reserved.</p>
  </div>
</footer>`,
        cssCode: `.site-footer { background: #1f2937; color: white; padding: 3rem 2rem 1rem; }
.footer-content { display: flex; gap: 4rem; max-width: 1200px; margin: 0 auto 2rem; }
.footer-section h4 { margin-bottom: 1rem; font-size: 1.1rem; }
.footer-section ul { list-style: none; padding: 0; }
.footer-section li { margin-bottom: 0.5rem; }
.footer-section a { color: #9ca3af; text-decoration: none; }
.footer-section a:hover { color: white; }
.footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid #374151; color: #9ca3af; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
      },
      {
        name: "Tailwind Card",
        category: "Cards",
        htmlCode: `<div class="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
  <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
  <div class="p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
    <p class="text-gray-600">This is a Tailwind CSS styled card component.</p>
    <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Learn More</button>
  </div>
</div>`,
        cssCode: "",
        jsCode: "",
        thumbnail: null,
        framework: "tailwind",
      },
      {
        name: "Bootstrap Alert",
        category: "Alerts",
        htmlCode: `<div class="alert alert-primary" role="alert">
  <strong>Info!</strong> This is a Bootstrap styled alert component.
</div>
<div class="alert alert-success" role="alert">
  <strong>Success!</strong> Operation completed successfully.
</div>
<div class="alert alert-danger" role="alert">
  <strong>Error!</strong> Something went wrong.
</div>`,
        cssCode: "",
        jsCode: "",
        thumbnail: null,
        framework: "bootstrap",
      },
    ];

    for (const component of sampleComponents) {
      await db.insert(components).values(component);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Message methods
  async getMessagesByProject(projectId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(insertTemplate).returning();
    return template;
  }

  // Project Versions methods
  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    return db
      .select()
      .from(projectVersions)
      .where(eq(projectVersions.projectId, projectId))
      .orderBy(desc(projectVersions.createdAt));
  }

  async getProjectVersion(id: string): Promise<ProjectVersion | undefined> {
    const [version] = await db.select().from(projectVersions).where(eq(projectVersions.id, id));
    return version || undefined;
  }

  async createProjectVersion(insertVersion: InsertProjectVersion): Promise<ProjectVersion> {
    const [version] = await db.insert(projectVersions).values(insertVersion).returning();
    return version;
  }

  // Share Links methods
  async getShareLink(shareCode: string): Promise<ShareLink | undefined> {
    const [link] = await db.select().from(shareLinks).where(eq(shareLinks.shareCode, shareCode));
    return link || undefined;
  }

  async getShareLinksByProject(projectId: string): Promise<ShareLink[]> {
    return db.select().from(shareLinks).where(eq(shareLinks.projectId, projectId));
  }

  async createShareLink(insertLink: InsertShareLink): Promise<ShareLink> {
    const [link] = await db.insert(shareLinks).values(insertLink).returning();
    return link;
  }

  async deactivateShareLink(id: string): Promise<boolean> {
    const result = await db
      .update(shareLinks)
      .set({ isActive: "false" })
      .where(eq(shareLinks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Components methods
  async getComponents(): Promise<Component[]> {
    return db.select().from(components);
  }

  async getComponentsByCategory(category: string): Promise<Component[]> {
    return db.select().from(components).where(eq(components.category, category));
  }

  async getComponent(id: string): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component || undefined;
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const [component] = await db.insert(components).values(insertComponent).returning();
    return component;
  }
}

export const storage = new DatabaseStorage();
