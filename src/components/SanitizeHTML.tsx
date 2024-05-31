import sanitizeHtml from 'sanitize-html';

const defaultOptions = {
  allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
  allowedAttributes: {
    'a': [ 'href' ]
  },
  allowedIframeHostnames: ['www.youtube.com']
};

const sanitize = (dirty: string, options: Options = {}) => ({
  __html: sanitizeHtml(dirty, { ...defaultOptions, ...options })
});

type Options = {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  allowedIframeHostnames?: string[];
};

type SanitizeHTMLProps = {
  html: string;
  options?: Options;
};
const SanitizeHTML = ({ html, options }: SanitizeHTMLProps) => (
  <span dangerouslySetInnerHTML={sanitize(html, options)} />
);

export default SanitizeHTML;
