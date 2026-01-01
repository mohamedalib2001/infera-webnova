import { Router, Request, Response } from "express";
import { db } from "./db";
import { sovereignPlans, planMilestones, insertSovereignPlanSchema, insertPlanMilestoneSchema } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/api/sovereign-plans", async (req: Request, res: Response) => {
  try {
    const plans = await db
      .select()
      .from(sovereignPlans)
      .orderBy(desc(sovereignPlans.createdAt));

    res.json(plans);
  } catch (error) {
    console.error("Error fetching sovereign plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

router.get("/api/sovereign-plans/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [plan] = await db
      .select()
      .from(sovereignPlans)
      .where(eq(sovereignPlans.id, id));

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const milestones = await db
      .select()
      .from(planMilestones)
      .where(eq(planMilestones.planId, id))
      .orderBy(planMilestones.sortOrder);

    res.json({ ...plan, milestones });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

router.post("/api/sovereign-plans", async (req: Request, res: Response) => {
  try {
    const data = insertSovereignPlanSchema.parse(req.body);

    const [plan] = await db
      .insert(sovereignPlans)
      .values(data)
      .returning();

    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating plan:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create plan" });
  }
});

router.patch("/api/sovereign-plans/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [plan] = await db
      .update(sovereignPlans)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(sovereignPlans.id, id))
      .returning();

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

router.patch("/api/sovereign-plans/:id/launch", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [plan] = await db
      .update(sovereignPlans)
      .set({
        status: "active",
        launchedAt: new Date(),
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sovereignPlans.id, id))
      .returning();

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Error launching plan:", error);
    res.status(500).json({ error: "Failed to launch plan" });
  }
});

router.delete("/api/sovereign-plans/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [plan] = await db
      .delete(sovereignPlans)
      .where(eq(sovereignPlans.id, id))
      .returning();

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

router.post("/api/sovereign-plans/:planId/milestones", async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const data = insertPlanMilestoneSchema.parse({ ...req.body, planId });

    const [milestone] = await db
      .insert(planMilestones)
      .values(data)
      .returning();

    res.status(201).json(milestone);
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ error: "Failed to create milestone" });
  }
});

router.patch("/api/sovereign-plans/milestones/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [milestone] = await db
      .update(planMilestones)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(eq(planMilestones.id, parseInt(id)))
      .returning();

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json(milestone);
  } catch (error) {
    console.error("Error completing milestone:", error);
    res.status(500).json({ error: "Failed to complete milestone" });
  }
});

router.get("/api/sovereign-plans/active/current", async (req: Request, res: Response) => {
  try {
    const [plan] = await db
      .select()
      .from(sovereignPlans)
      .where(eq(sovereignPlans.status, "active"))
      .orderBy(desc(sovereignPlans.launchedAt))
      .limit(1);

    if (!plan) {
      return res.json(null);
    }

    const milestones = await db
      .select()
      .from(planMilestones)
      .where(eq(planMilestones.planId, plan.id))
      .orderBy(planMilestones.sortOrder);

    res.json({ ...plan, milestones });
  } catch (error) {
    console.error("Error fetching active plan:", error);
    res.status(500).json({ error: "Failed to fetch active plan" });
  }
});

export default router;
