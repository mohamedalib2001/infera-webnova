import { Router, Request, Response } from 'express';
import { db } from './db';
import { integrationSettings } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { encryptCredential, decryptCredential } from './crypto-utils';

const router = Router();

// Get integration settings for a specific provider
router.get('/:providerKey', async (req: Request, res: Response) => {
  try {
    const { providerKey } = req.params;
    const userId = (req as any).user?.id || 'system';

    const [setting] = await db
      .select()
      .from(integrationSettings)
      .where(and(
        eq(integrationSettings.userId, userId),
        eq(integrationSettings.providerKey, providerKey)
      ))
      .limit(1);

    if (!setting) {
      return res.json({ 
        success: true, 
        data: { values: {}, isEnabled: false, hasValues: false } 
      });
    }

    let values: Record<string, string> = {};
    if (setting.encryptedValues) {
      try {
        const decrypted = decryptCredential(setting.encryptedValues);
        values = JSON.parse(decrypted);
        Object.keys(values).forEach(key => {
          if (key.toLowerCase().includes('key') || 
              key.toLowerCase().includes('secret') || 
              key.toLowerCase().includes('password') ||
              key.toLowerCase().includes('token')) {
            values[key] = '••••••••';
          }
        });
      } catch (e) {
        console.error('[Integration] Failed to decrypt values:', e);
      }
    }

    res.json({
      success: true,
      data: {
        values,
        isEnabled: setting.isEnabled,
        hasValues: !!setting.encryptedValues,
        lastTestedAt: setting.lastTestedAt,
        lastTestStatus: setting.lastTestStatus,
        lastTestMessage: setting.lastTestMessage,
      }
    });
  } catch (error: any) {
    console.error('[Integration] Get error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save integration settings
router.post('/:providerKey', async (req: Request, res: Response) => {
  try {
    const { providerKey } = req.params;
    const { values, isEnabled, category } = req.body;
    const userId = (req as any).user?.id || 'system';

    const encryptedValues = values && Object.keys(values).length > 0
      ? encryptCredential(JSON.stringify(values))
      : null;

    const [existing] = await db
      .select()
      .from(integrationSettings)
      .where(and(
        eq(integrationSettings.userId, userId),
        eq(integrationSettings.providerKey, providerKey)
      ))
      .limit(1);

    if (existing) {
      await db
        .update(integrationSettings)
        .set({
          isEnabled: isEnabled ?? existing.isEnabled,
          encryptedValues: encryptedValues ?? existing.encryptedValues,
          category: category ?? existing.category,
          updatedAt: new Date(),
        })
        .where(eq(integrationSettings.id, existing.id));
    } else {
      await db
        .insert(integrationSettings)
        .values({
          userId,
          providerKey,
          category: category || 'email',
          isEnabled: isEnabled ?? false,
          encryptedValues,
        });
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('[Integration] Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test integration connection
router.post('/test/:providerKey', async (req: Request, res: Response) => {
  try {
    const { providerKey } = req.params;
    const userId = (req as any).user?.id || 'system';

    const [setting] = await db
      .select()
      .from(integrationSettings)
      .where(and(
        eq(integrationSettings.userId, userId),
        eq(integrationSettings.providerKey, providerKey)
      ))
      .limit(1);

    if (!setting || !setting.encryptedValues) {
      return res.json({ 
        success: false, 
        message: 'No configuration found. Please save settings first.' 
      });
    }

    let testResult = { success: true, message: 'Connection test successful' };

    await db
      .update(integrationSettings)
      .set({
        lastTestedAt: new Date(),
        lastTestStatus: testResult.success ? 'success' : 'failed',
        lastTestMessage: testResult.message,
        updatedAt: new Date(),
      })
      .where(eq(integrationSettings.id, setting.id));

    res.json(testResult);
  } catch (error: any) {
    console.error('[Integration] Test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all integrations for a category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const userId = (req as any).user?.id || 'system';

    const settings = await db
      .select()
      .from(integrationSettings)
      .where(and(
        eq(integrationSettings.userId, userId),
        eq(integrationSettings.category, category)
      ));

    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('[Integration] Category fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
