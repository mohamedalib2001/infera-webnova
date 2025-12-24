import { Router } from "express";
import { db } from "./db";
import { sidebarSections, sidebarPages, sidebarUserPreferences, sidebarVisibilityLogs } from "@shared/schema";
import { eq, asc, and, inArray } from "drizzle-orm";

const router = Router();

// Get all sidebar sections with their pages (filtered by user role)
router.get("/api/sidebar/config", async (req, res) => {
  try {
    const user = req.user as any;
    const userRole = user?.role || 'free';
    const isOwner = userRole === 'owner' || userRole === 'admin';

    // Get all sections ordered
    const sections = await db
      .select()
      .from(sidebarSections)
      .orderBy(asc(sidebarSections.displayOrder));

    // Get all pages ordered
    const pages = await db
      .select()
      .from(sidebarPages)
      .orderBy(asc(sidebarPages.displayOrder));

    // Filter sections based on role
    const filteredSections = sections.filter(section => {
      // Owner override takes precedence
      if (section.ownerOverrideVisible !== null) {
        return section.ownerOverrideVisible;
      }
      // Check visibility
      if (!section.isVisible) return false;
      // Check roles
      const roles = section.visibleToRoles as string[];
      if (roles.includes('all')) return true;
      return roles.includes(userRole) || isOwner;
    });

    // Filter pages based on role
    const filteredPages = pages.filter(page => {
      // Owner override takes precedence
      if (page.ownerOverrideVisible !== null) {
        return page.ownerOverrideVisible;
      }
      // Check visibility
      if (!page.isVisible) return false;
      // Check roles
      const roles = page.visibleToRoles as string[];
      if (roles.includes('all')) return true;
      return roles.includes(userRole) || isOwner;
    });

    // Group pages by section
    const sectionMap = filteredSections.map(section => ({
      ...section,
      pages: filteredPages.filter(p => p.sectionKey === section.sectionKey)
    }));

    res.json({
      sections: sectionMap,
      userRole,
      isOwner
    });
  } catch (error: any) {
    console.error("Error fetching sidebar config:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sections and pages for owner management (no filtering)
router.get("/api/sidebar/admin/config", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const sections = await db
      .select()
      .from(sidebarSections)
      .orderBy(asc(sidebarSections.displayOrder));

    const pages = await db
      .select()
      .from(sidebarPages)
      .orderBy(asc(sidebarPages.displayOrder));

    const sectionMap = sections.map(section => ({
      ...section,
      pages: pages.filter(p => p.sectionKey === section.sectionKey)
    }));

    res.json({ sections: sectionMap });
  } catch (error: any) {
    console.error("Error fetching admin sidebar config:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update section visibility
router.patch("/api/sidebar/section/:sectionKey", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const { sectionKey } = req.params;
    const { isVisible, visibleToRoles, displayOrder, ownerOverrideVisible } = req.body;

    // Get current state for logging
    const [current] = await db
      .select()
      .from(sidebarSections)
      .where(eq(sidebarSections.sectionKey, sectionKey));

    if (!current) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (visibleToRoles !== undefined) updateData.visibleToRoles = visibleToRoles;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (ownerOverrideVisible !== undefined) updateData.ownerOverrideVisible = ownerOverrideVisible;

    // Update section
    const [updated] = await db
      .update(sidebarSections)
      .set(updateData)
      .where(eq(sidebarSections.sectionKey, sectionKey))
      .returning();

    // Log the change
    await db.insert(sidebarVisibilityLogs).values({
      targetType: 'section',
      targetKey: sectionKey,
      action: isVisible === false ? 'hide' : 'update',
      previousValue: { isVisible: current.isVisible, visibleToRoles: current.visibleToRoles },
      newValue: updateData,
      changedBy: user.id,
    });

    res.json({ section: updated });
  } catch (error: any) {
    console.error("Error updating section:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update page visibility
router.patch("/api/sidebar/page/:pageKey", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const { pageKey } = req.params;
    const { isVisible, visibleToRoles, displayOrder, ownerOverrideVisible, badge, badgeVariant } = req.body;

    // Get current state for logging
    const [current] = await db
      .select()
      .from(sidebarPages)
      .where(eq(sidebarPages.pageKey, pageKey));

    if (!current) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (visibleToRoles !== undefined) updateData.visibleToRoles = visibleToRoles;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (ownerOverrideVisible !== undefined) updateData.ownerOverrideVisible = ownerOverrideVisible;
    if (badge !== undefined) updateData.badge = badge;
    if (badgeVariant !== undefined) updateData.badgeVariant = badgeVariant;

    // Update page
    const [updated] = await db
      .update(sidebarPages)
      .set(updateData)
      .where(eq(sidebarPages.pageKey, pageKey))
      .returning();

    // Log the change
    await db.insert(sidebarVisibilityLogs).values({
      targetType: 'page',
      targetKey: pageKey,
      action: isVisible === false ? 'hide' : 'update',
      previousValue: { isVisible: current.isVisible, visibleToRoles: current.visibleToRoles },
      newValue: updateData,
      changedBy: user.id,
    });

    res.json({ page: updated });
  } catch (error: any) {
    console.error("Error updating page:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk update section order
router.post("/api/sidebar/reorder-sections", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const { sectionKeys } = req.body; // Array of section keys in new order

    for (let i = 0; i < sectionKeys.length; i++) {
      await db
        .update(sidebarSections)
        .set({ displayOrder: i + 1, updatedAt: new Date() })
        .where(eq(sidebarSections.sectionKey, sectionKeys[i]));
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error reordering sections:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk update page order within a section
router.post("/api/sidebar/reorder-pages", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const { pageKeys } = req.body; // Array of page keys in new order

    for (let i = 0; i < pageKeys.length; i++) {
      await db
        .update(sidebarPages)
        .set({ displayOrder: i + 1, updatedAt: new Date() })
        .where(eq(sidebarPages.pageKey, pageKeys[i]));
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error reordering pages:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get visibility logs
router.get("/api/sidebar/logs", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const logs = await db
      .select()
      .from(sidebarVisibilityLogs)
      .orderBy(asc(sidebarVisibilityLogs.createdAt))
      .limit(100);

    res.json({ logs });
  } catch (error: any) {
    console.error("Error fetching visibility logs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle section visibility (quick toggle)
router.post("/api/sidebar/section/:sectionKey/toggle", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const { sectionKey } = req.params;

    const [current] = await db
      .select()
      .from(sidebarSections)
      .where(eq(sidebarSections.sectionKey, sectionKey));

    if (!current) {
      return res.status(404).json({ error: "Section not found" });
    }

    const newVisibility = !current.isVisible;

    const [updated] = await db
      .update(sidebarSections)
      .set({ isVisible: newVisibility, updatedAt: new Date() })
      .where(eq(sidebarSections.sectionKey, sectionKey))
      .returning();

    // Log the change
    await db.insert(sidebarVisibilityLogs).values({
      targetType: 'section',
      targetKey: sectionKey,
      action: newVisibility ? 'show' : 'hide',
      previousValue: { isVisible: current.isVisible },
      newValue: { isVisible: newVisibility },
      changedBy: user.id,
    });

    res.json({ section: updated });
  } catch (error: any) {
    console.error("Error toggling section:", error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle page visibility (quick toggle)
router.post("/api/sidebar/page/:pageKey/toggle", async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ error: "Owner access required" });
    }

    const { pageKey } = req.params;

    const [current] = await db
      .select()
      .from(sidebarPages)
      .where(eq(sidebarPages.pageKey, pageKey));

    if (!current) {
      return res.status(404).json({ error: "Page not found" });
    }

    const newVisibility = !current.isVisible;

    const [updated] = await db
      .update(sidebarPages)
      .set({ isVisible: newVisibility, updatedAt: new Date() })
      .where(eq(sidebarPages.pageKey, pageKey))
      .returning();

    // Log the change
    await db.insert(sidebarVisibilityLogs).values({
      targetType: 'page',
      targetKey: pageKey,
      action: newVisibility ? 'show' : 'hide',
      previousValue: { isVisible: current.isVisible },
      newValue: { isVisible: newVisibility },
      changedBy: user.id,
    });

    res.json({ page: updated });
  } catch (error: any) {
    console.error("Error toggling page:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
