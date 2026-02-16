/**
 * Layout variant type used by LayoutContext and MailLayout.
 * Layout selection is driven by @/dynamic (e.g. seed-based in the future).
 */
export interface LayoutVariant {
  id: number;
  name: string;
  styles: {
    container: string;
    sidebar: string;
    toolbar: string;
    emailList: string;
    emailView: string;
  };
}

export const DEFAULT_LAYOUT_VARIANT: LayoutVariant = {
  id: 1,
  name: "Classic",
  styles: {
    container: "",
    sidebar: "",
    toolbar: "",
    emailList: "",
    emailView: "",
  },
};
