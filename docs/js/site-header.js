// Site Header React Component
const { createElement: h } = React;

function SiteHeader() {
  return h('header', { className: 'site-header' },
    h('h1', { className: 'siteHeading' },
      h('a', { href: '/' }, 'Paolo Di Pasquale')
    ),
    h('p', { className: 'tagline' }, 'Elaborating thoughts on the web')
  );
}

// Mount the component when the DOM is ready
if (document.getElementById('site-header-root')) {
  ReactDOM.render(
    h(SiteHeader),
    document.getElementById('site-header-root')
  );
}

