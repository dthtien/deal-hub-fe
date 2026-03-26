const STORE_DOMAINS: Record<string, string> = {
  'ASOS': 'asos.com',
  'The Iconic': 'theiconic.com.au',
  'Kmart': 'kmart.com.au',
  'Big W': 'bigw.com.au',
  'JB Hi-Fi': 'jbhifi.com.au',
  'Myer': 'myer.com.au',
  'Nike': 'nike.com',
  'Culture Kings': 'culturekings.com.au',
  'JD Sports': 'jdsports.com.au',
  'The Good Guys': 'thegoodguys.com.au',
  'Office Works': 'officeworks.com.au',
  'Glue Store': 'gluestore.com.au',
  'Target': 'target.com.au',
  'Booking.com': 'booking.com',
  'Good Buyz': 'goodbuyz.com.au',
};

interface Props {
  store: string;
  size?: number;
  className?: string;
}

export default function StoreLogo({ store, size = 16, className = '' }: Props) {
  const domain = STORE_DOMAINS[store];
  if (!domain) return null;

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`}
      alt={store}
      width={size}
      height={size}
      className={`rounded-sm flex-shrink-0 ${className}`}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
