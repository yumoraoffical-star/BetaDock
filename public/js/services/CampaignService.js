/**
 * CAMPAIGN SERVICE
 * Manages campaign state, content items (edit, copy, regen, delete),
 * and Content Calendar scheduling.
 */

const CAMPAIGN_STORAGE_KEY = 'betadock_campaigns_v1';
const CALENDAR_STORAGE_KEY = 'betadock_calendar_v1';

const CampaignService = {
  // Get active campaign for product
  getCampaign(productId) {
    const saved = localStorage.getItem(`${CAMPAIGN_STORAGE_KEY}_${productId}`);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  },

  // Save campaign
  saveCampaign(productId, campaignData) {
    localStorage.setItem(`${CAMPAIGN_STORAGE_KEY}_${productId}`, JSON.stringify(campaignData));
    this.syncToCalendar(productId, campaignData);
    return campaignData;
  },

  // Update a single channel's content
  updateChannelContent(productId, channelKey, newContent) {
    const campaign = this.getCampaign(productId);
    if (!campaign || !campaign.channels || !campaign.channels[channelKey]) return null;

    campaign.channels[channelKey].content = newContent;
    campaign.updatedAt = new Date().toISOString();
    this.saveCampaign(productId, campaign);
    return campaign;
  },

  // Delete channel item
  deleteChannelItem(productId, channelKey) {
    const campaign = this.getCampaign(productId);
    if (!campaign || !campaign.channels) return null;

    delete campaign.channels[channelKey];
    this.saveCampaign(productId, campaign);
    return campaign;
  },

  // 5 — Visual Content Calendar Sync & Management
  syncToCalendar(productId, campaignData) {
    const defaultSchedule = [
      { id: 'cal-1', day: 'Monday', date: 'Day 1', platform: 'LinkedIn', channelKey: 'linkedin', type: 'Product Announcement Post', status: 'Scheduled', time: '09:00 AM' },
      { id: 'cal-2', day: 'Tuesday', date: 'Day 2', platform: 'X (Twitter)', channelKey: 'x', type: 'Educational 4-Tweet Thread', status: 'Scheduled', time: '11:30 AM' },
      { id: 'cal-3', day: 'Wednesday', date: 'Day 3', platform: 'Pinterest', channelKey: 'pinterest', type: 'Product Infographic Pin', status: 'Draft', time: '02:00 PM' },
      { id: 'cal-4', day: 'Thursday', date: 'Day 4', platform: 'Instagram', channelKey: 'instagram', type: 'Feature Showcase Reel & Carousel', status: 'Draft', time: '05:00 PM' },
      { id: 'cal-5', day: 'Friday', date: 'Day 5', platform: 'LinkedIn', channelKey: 'linkedin', type: 'Use Case & Founder Proof', status: 'Draft', time: '10:00 AM' },
      { id: 'cal-6', day: 'Saturday', date: 'Day 6', platform: 'Reddit', channelKey: 'reddit', type: 'Community-Friendly Problem Post', status: 'Draft', time: '03:00 PM' },
      { id: 'cal-7', day: 'Sunday', date: 'Day 7', platform: 'Product Hunt', channelKey: 'producthunt', type: 'Official Launch Sprint & Pitch', status: 'Scheduled', time: '12:01 AM' }
    ];

    const existingCalendar = this.getCalendar(productId);
    if (!existingCalendar) {
      localStorage.setItem(`${CALENDAR_STORAGE_KEY}_${productId}`, JSON.stringify(defaultSchedule));
    }
  },

  getCalendar(productId) {
    const saved = localStorage.getItem(`${CALENDAR_STORAGE_KEY}_${productId}`);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  },

  updateCalendarItem(productId, itemId, updates) {
    let calendar = this.getCalendar(productId) || [];
    const index = calendar.findIndex(item => item.id === itemId);
    if (index >= 0) {
      calendar[index] = { ...calendar[index], ...updates };
      localStorage.setItem(`${CALENDAR_STORAGE_KEY}_${productId}`, JSON.stringify(calendar));
    }
    return calendar;
  },

  toggleCalendarItemStatus(productId, itemId) {
    let calendar = this.getCalendar(productId) || [];
    const index = calendar.findIndex(item => item.id === itemId);
    if (index >= 0) {
      const current = calendar[index].status;
      calendar[index].status = current === 'Completed' ? 'Scheduled' : 'Completed';
      localStorage.setItem(`${CALENDAR_STORAGE_KEY}_${productId}`, JSON.stringify(calendar));
    }
    return calendar;
  }
};
