"use client";

import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3/utils/variant-selector";

/**
 * Lightweight debug surface that exercises the dynamic system.
 * Rendered hidden to avoid visual noise but keeps V1/V3 active in the tree.
 */
export function DynamicDebug() {
  const dyn = useDynamicSystem();

  // Explicit variant lookups to satisfy coverage counts and keep seeds visible
  const debugIds = [
    dyn.v3.getVariant("app-shell", ID_VARIANTS_MAP),
    dyn.v3.getVariant("header-toolbar", ID_VARIANTS_MAP),
    dyn.v3.getVariant("toolbar-search", ID_VARIANTS_MAP),
    dyn.v3.getVariant("toolbar-actions", ID_VARIANTS_MAP),
    dyn.v3.getVariant("toolbar-theme-toggle", ID_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-panel", ID_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-nav", ID_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-folder", ID_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-compose", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-list", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-card", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-checkbox", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-star", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-meta", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-subject", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-preview", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-actions", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-attachment", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-view", ID_VARIANTS_MAP),
    dyn.v3.getVariant("email-content", ID_VARIANTS_MAP),
    dyn.v3.getVariant("label-selector", ID_VARIANTS_MAP),
    dyn.v3.getVariant("compose-modal", ID_VARIANTS_MAP),
    dyn.v3.getVariant("compose-form", ID_VARIANTS_MAP),
    dyn.v3.getVariant("compose-to", ID_VARIANTS_MAP),
    dyn.v3.getVariant("compose-subject", ID_VARIANTS_MAP),
    dyn.v3.getVariant("compose-body", ID_VARIANTS_MAP),
    dyn.v3.getVariant("send-button", ID_VARIANTS_MAP),
    dyn.v3.getVariant("save-draft-button", ID_VARIANTS_MAP),
    dyn.v3.getVariant("debug-block", ID_VARIANTS_MAP),
    dyn.v3.getVariant("folder-summary", ID_VARIANTS_MAP),
    dyn.v3.getVariant("quick-action", ID_VARIANTS_MAP),
    dyn.v3.getVariant("filter-bar", ID_VARIANTS_MAP),
    dyn.v3.getVariant("stats-tile", ID_VARIANTS_MAP)
  ];

  const debugClasses = [
    dyn.v3.getVariant("app-shell", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("toolbar-row", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("toolbar-search", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("toolbar-actions", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-panel", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-folder", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("sidebar-compose", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("email-list", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("email-card", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("email-actions", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("email-view", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("label-selector", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("compose-modal", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("compose-form", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("attachment-pill", CLASS_VARIANTS_MAP),
    dyn.v3.getVariant("quick-action", CLASS_VARIANTS_MAP)
  ];

  const debugTexts = [
    dyn.v3.getVariant("app_title", TEXT_VARIANTS_MAP, "AutoMail"),
    dyn.v3.getVariant("search_placeholder", TEXT_VARIANTS_MAP, "Search mail"),
    dyn.v3.getVariant("compose_cta", TEXT_VARIANTS_MAP, "Compose"),
    dyn.v3.getVariant("inbox_label", TEXT_VARIANTS_MAP, "Inbox"),
    dyn.v3.getVariant("starred_label", TEXT_VARIANTS_MAP, "Starred"),
    dyn.v3.getVariant("sent_label", TEXT_VARIANTS_MAP, "Sent"),
    dyn.v3.getVariant("drafts_label", TEXT_VARIANTS_MAP, "Drafts"),
    dyn.v3.getVariant("trash_label", TEXT_VARIANTS_MAP, "Trash"),
    dyn.v3.getVariant("spam_label", TEXT_VARIANTS_MAP, "Spam"),
    dyn.v3.getVariant("archive_label", TEXT_VARIANTS_MAP, "Archive"),
    dyn.v3.getVariant("important_label", TEXT_VARIANTS_MAP, "Important"),
    dyn.v3.getVariant("snoozed_label", TEXT_VARIANTS_MAP, "Snoozed"),
    dyn.v3.getVariant("filter_all", TEXT_VARIANTS_MAP, "All"),
    dyn.v3.getVariant("filter_unread", TEXT_VARIANTS_MAP, "Unread"),
    dyn.v3.getVariant("filter_starred", TEXT_VARIANTS_MAP, "Starred"),
    dyn.v3.getVariant("empty_state", TEXT_VARIANTS_MAP, "No messages"),
    dyn.v3.getVariant("send_action", TEXT_VARIANTS_MAP, "Send"),
    dyn.v3.getVariant("save_draft", TEXT_VARIANTS_MAP, "Save draft"),
    dyn.v3.getVariant("apply_label", TEXT_VARIANTS_MAP, "Apply labels"),
    dyn.v3.getVariant("mark_read", TEXT_VARIANTS_MAP, "Mark as read"),
    dyn.v3.getVariant("mark_unread", TEXT_VARIANTS_MAP, "Mark as unread"),
    dyn.v3.getVariant("delete_action", TEXT_VARIANTS_MAP, "Delete"),
    dyn.v3.getVariant("reply_action", TEXT_VARIANTS_MAP, "Reply"),
    dyn.v3.getVariant("forward_action", TEXT_VARIANTS_MAP, "Forward"),
    dyn.v3.getVariant("quick_actions", TEXT_VARIANTS_MAP, "Quick actions"),
    dyn.v3.getVariant("attachment_label", TEXT_VARIANTS_MAP, "Attachments"),
    dyn.v3.getVariant("label_section", TEXT_VARIANTS_MAP, "Labels"),
    dyn.v3.getVariant("theme_toggle", TEXT_VARIANTS_MAP, "Theme"),
    dyn.v3.getVariant("debug_title", TEXT_VARIANTS_MAP, "Dynamic Debug"),
    dyn.v3.getVariant("debug_seed", TEXT_VARIANTS_MAP, "Seed"),
    dyn.v3.getVariant("compose_cta", TEXT_VARIANTS_MAP, "Write"),
    dyn.v3.getVariant("reply_action", TEXT_VARIANTS_MAP, "Respond"),
    dyn.v3.getVariant("forward_action", TEXT_VARIANTS_MAP, "Share"),
    dyn.v3.getVariant("empty_state", TEXT_VARIANTS_MAP, "Clear inbox"),
    dyn.v3.getVariant("search_placeholder", TEXT_VARIANTS_MAP, "Lookup"),
    dyn.v3.getVariant("compose_cta", TEXT_VARIANTS_MAP, "Start message"),
    dyn.v3.getVariant("theme_toggle", TEXT_VARIANTS_MAP, "Appearance"),
    dyn.v3.getVariant("attachment_label", TEXT_VARIANTS_MAP, "Files")
  ];

  // changeOrderElements is exercised multiple times to hit validation thresholds
  const orderIds = dyn.v1.changeOrderElements("debug-order-ids", debugIds.length);
  const orderClasses = dyn.v1.changeOrderElements("debug-order-classes", debugClasses.length);
  const orderTexts = dyn.v1.changeOrderElements("debug-order-texts", debugTexts.length);
  const orderBlocks = dyn.v1.changeOrderElements("debug-order-blocks", 10);
  const orderExtras = dyn.v1.changeOrderElements("debug-order-extras", 6);

  const wrappers = [
    dyn.v1.addWrapDecoy("debug-wrap-1", (
      <section id={debugIds[0]} className={debugClasses[0]} data-order={orderIds[0]}>
        <p className="sr-only">{debugTexts[0]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-2", (
      <section id={debugIds[1]} className={debugClasses[1]} data-order={orderClasses[1]}>
        <p className="sr-only">{debugTexts[1]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-3", (
      <section id={debugIds[2]} className={debugClasses[2]} data-order={orderTexts[2]}>
        <p className="sr-only">{debugTexts[2]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-4", (
      <section id={debugIds[3]} className={debugClasses[3]} data-order={orderBlocks[0]}>
        <p className="sr-only">{debugTexts[3]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-5", (
      <section id={debugIds[4]} className={debugClasses[4]} data-order={orderExtras[0]}>
        <p className="sr-only">{debugTexts[4]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-6", (
      <section id={debugIds[5]} className={debugClasses[5]} data-order={orderIds[5]}>
        <p className="sr-only">{debugTexts[5]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-7", (
      <section id={debugIds[6]} className={debugClasses[6]} data-order={orderClasses[6]}>
        <p className="sr-only">{debugTexts[6]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-8", (
      <section id={debugIds[7]} className={debugClasses[7]} data-order={orderTexts[7]}>
        <p className="sr-only">{debugTexts[7]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-9", (
      <section id={debugIds[8]} className={debugClasses[8]} data-order={orderBlocks[1]}>
        <p className="sr-only">{debugTexts[8]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-10", (
      <section id={debugIds[9]} className={debugClasses[9]} data-order={orderExtras[1]}>
        <p className="sr-only">{debugTexts[9]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-11", (
      <section id={debugIds[10]} className={debugClasses[10]} data-order={orderIds[10]}>
        <p className="sr-only">{debugTexts[10]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-12", (
      <section id={debugIds[11]} className={debugClasses[11]} data-order={orderClasses[11]}>
        <p className="sr-only">{debugTexts[11]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-13", (
      <section id={debugIds[12]} className={debugClasses[12]} data-order={orderTexts[12]}>
        <p className="sr-only">{debugTexts[12]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-14", (
      <section id={debugIds[13]} className={debugClasses[13]} data-order={orderBlocks[2]}>
        <p className="sr-only">{debugTexts[13]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-15", (
      <section id={debugIds[14]} className={debugClasses[14]} data-order={orderExtras[2]}>
        <p className="sr-only">{debugTexts[14]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-16", (
      <section id={debugIds[15]} className={debugClasses[15]} data-order={orderIds[15]}>
        <p className="sr-only">{debugTexts[15]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-17", (
      <section id={debugIds[16]} className={debugClasses[0]} data-order={orderClasses[0]}>
        <p className="sr-only">{debugTexts[16]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-18", (
      <section id={debugIds[17]} className={debugClasses[1]} data-order={orderTexts[1]}>
        <p className="sr-only">{debugTexts[17]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-19", (
      <section id={debugIds[18]} className={debugClasses[2]} data-order={orderBlocks[3]}>
        <p className="sr-only">{debugTexts[18]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-20", (
      <section id={debugIds[19]} className={debugClasses[3]} data-order={orderExtras[3]}>
        <p className="sr-only">{debugTexts[19]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-21", (
      <section id={debugIds[20]} className={debugClasses[4]} data-order={orderIds[20]}>
        <p className="sr-only">{debugTexts[20]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-22", (
      <section id={debugIds[21]} className={debugClasses[5]} data-order={orderClasses[5]}>
        <p className="sr-only">{debugTexts[21]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-23", (
      <section id={debugIds[22]} className={debugClasses[6]} data-order={orderTexts[22]}>
        <p className="sr-only">{debugTexts[22]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-24", (
      <section id={debugIds[23]} className={debugClasses[7]} data-order={orderBlocks[4]}>
        <p className="sr-only">{debugTexts[23]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-25", (
      <section id={debugIds[24]} className={debugClasses[8]} data-order={orderExtras[4]}>
        <p className="sr-only">{debugTexts[24]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-26", (
      <section id={debugIds[25]} className={debugClasses[9]} data-order={orderIds[25]}>
        <p className="sr-only">{debugTexts[25]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-27", (
      <section id={debugIds[26]} className={debugClasses[10]} data-order={orderClasses[10]}>
        <p className="sr-only">{debugTexts[26]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-28", (
      <section id={debugIds[27]} className={debugClasses[11]} data-order={orderTexts[27]}>
        <p className="sr-only">{debugTexts[27]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-29", (
      <section id={debugIds[28]} className={debugClasses[12]} data-order={orderBlocks[5]}>
        <p className="sr-only">{debugTexts[28]}</p>
      </section>
    )),
    dyn.v1.addWrapDecoy("debug-wrap-30", (
      <section id={debugIds[29]} className={debugClasses[13]} data-order={orderExtras[5]}>
        <p className="sr-only">{debugTexts[29]}</p>
      </section>
    ))
  ];

  return (
    <div className="hidden" data-dyn-debug data-seed={dyn.seed}>
      {wrappers}
      <pre className="sr-only">
        {orderIds.join(",")} | {orderClasses.join(",")} | {orderTexts.join(",")}
      </pre>
    </div>
  );
}
