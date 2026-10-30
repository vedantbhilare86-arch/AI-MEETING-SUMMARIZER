/**
 * Realistic 90-Minute Product Strategy & Q4 Launch Alignment Meeting Transcript
 * Word count: ~820 words (~90 min conversational pace compressed for realistic demo)
 * 4 Speakers: Priya Nair (Product Lead), Marcus Vance (Eng Director), Elena Rostova (Lead UX), David Kim (Growth Lead)
 */

const SAMPLE_TRANSCRIPT = `Priya Nair: Alright everyone, let's kick off our Q4 sprint alignment and release readiness review. We have 90 minutes on the clock, and our primary goal today is locking down the scope for the V2.4 AI intelligence rollout, resolving the infrastructure bottlenecks Marcus highlighted yesterday, and committing to the enterprise customer beta timeline.

Marcus Vance: Thanks Priya. Let me give a direct update on the backend infrastructure first. Over the weekend, the team benchmarked our inference latency with the new hybrid pipeline. Under 5,000 concurrent streaming audio connections, our P99 latency spiked up to 840 milliseconds on the legacy US-East cluster. That is well above our 350-millisecond SLA threshold. However, shifting real-time summarization chunks to GPU worker nodes in AWS us-west-2 brought P99 down to 210 milliseconds with zero dropped websocket packets.

David Kim: Marcus, does that GPU reallocation blow our Q4 cloud infrastructure budget? Finance was very firm that we cannot exceed the 18% variance cap before the annual audit in December.

Marcus Vance: Good question, David. Actually, by adopting dynamic spot instances and automated scale-down policies during off-peak hours between 10 PM and 5 AM, total compute costs are projected to increase by only 9.4%, which keeps us comfortably under the 18% cap.

Priya Nair: That is huge news. So we decided to approve the AWS us-west-2 GPU node migration for the streaming audio inference pipeline. That clears the latency blocker. Marcus, can you finalize the Terraform migration scripts by Friday, October 28th?

Marcus Vance: Yes, I will finalize the Terraform migration scripts and run load tests across all staging clusters by Friday, October 28th. I'll make sure the DevOps team signs off on the rollback runbook as well.

Elena Rostova: Shifting over to the client interface and user onboarding flow. We completed six usability test sessions yesterday on the new Action Items drawer and interactive speaker diarization cards. Users loved the inline assignment tags, but five out of six testers struggled with the nested priority dropdown. It added too many clicks when triaging twenty action items after a long meeting.

Priya Nair: What is your recommendation for simplifying that, Elena?

Elena Rostova: We should replace the nested dropdown with one-click inline pill badges for High, Medium, and Low priorities, plus an instant keyboard shortcut like Shift+P. Also, our accessibility audit showed contrast issues on the status badges in dark mode.

Priya Nair: Agreed. Let's go with the inline pill badges and direct keyboard shortcuts. Elena, please deliver the revised Figma component library and WCAG-compliant design tokens by Monday, October 31st.

Elena Rostova: Absolutely. Elena will deliver the updated Figma specs, contrast-verified tokens, and handoff documentation to the frontend team by Monday, October 31st at EOD.

David Kim: On the go-to-market side, we have twenty-eight Fortune 500 enterprise accounts currently queued for the closed pilot. Enterprise clients are requesting HIPAA and SOC-2 Type II attestation letters before authorizing live meeting recording across their internal teams.

Priya Nair: That's a critical compliance checkpoint. We confirmed that our legal team finalized the SOC-2 Type II audit package last week. David, will you coordinate with legal to publish the enterprise trust portal and prepare the customer agreement addendums by Wednesday, November 2nd?

David Kim: Yes, I will coordinate with legal and publish the customer compliance portal with downloadable security whitepapers by Wednesday, November 2nd. Also, I need Marcus to review the data retention and automated audio redaction section by Thursday.

Marcus Vance: I will review and sign off on the data retention compliance policy by Thursday, November 3rd.

Priya Nair: Perfect. Now regarding the mobile companion app: the iOS build is 85% complete, but Android speech-to-text background synchronization is lagging by two sprints due to native audio driver fragmentation on older Samsung devices.

Marcus Vance: We have two options: delay the entire public launch by three weeks to launch iOS and Android simultaneously, or release iOS first on November 15th and launch Android in January as Phase 2.

David Kim: From a marketing and competitive standpoint, delaying the launch hurts our Q4 momentum. Over 70% of our enterprise waitlist users are on iOS corporate devices anyway.

Priya Nair: We finalized our launch plan: we will launch the iOS companion app first on November 15th, and schedule the Android release for January 10th. Elena, can you update the mobile app store screenshots and feature banners by Friday, November 4th?

Elena Rostova: I will update all mobile store marketing assets and visual guidelines by Friday, November 4th.

Priya Nair: Fantastic. And David, please prepare the press kit, customer case study with Acme Corp, and executive email blast by Monday, November 7th.

David Kim: I'll prepare the press kit, draft the executive launch announcement, and coordinate with Acme Corp for the quote approvals by Monday, November 7th.

Priya Nair: Excellent progress everyone. We agreed on our migration plan, finalized the mobile rollout strategy, and approved all key design updates. Let's reconvene on Thursday for the mid-sprint checkpoint. Meeting adjourned!`;

// Export for module environments if needed, while remaining globally accessible for plain HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_TRANSCRIPT };
}
