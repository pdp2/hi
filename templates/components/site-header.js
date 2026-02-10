// Shim for build-time (Deno) where HTMLElement doesn't exist
const BaseElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

export class SiteHeader extends BaseElement {
  static tagName = 'site-header';
  static templatePath = './templates/components/site-header.template.html';

  static render(templateContent) {
    return templateContent;
  }

  connectedCallback() {
    console.log('SiteHeader component loaded in DOM');
  }
}

// Register the component in browser context
if (typeof customElements !== 'undefined') {
  customElements.define(SiteHeader.tagName, SiteHeader);
}
