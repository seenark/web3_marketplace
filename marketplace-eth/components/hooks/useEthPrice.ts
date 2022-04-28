import useSWR from "swr";

export interface CurrentPrice {
  aed: number;
  ars: number;
  aud: number;
  bch: number;
  bdt: number;
  bhd: number;
  bmd: number;
  bnb: number;
  brl: number;
  btc: number;
  cad: number;
  chf: number;
  clp: number;
  cny: number;
  czk: number;
  dkk: number;
  dot: number;
  eos: number;
  eth: number;
  eur: number;
  gbp: number;
  hkd: number;
  huf: number;
  idr: number;
  ils: number;
  inr: number;
  jpy: number;
  krw: number;
  kwd: number;
  lkr: number;
  ltc: number;
  mmk: number;
  mxn: number;
  myr: number;
  ngn: number;
  nok: number;
  nzd: number;
  php: number;
  pkr: number;
  pln: number;
  rub: number;
  sar: number;
  sek: number;
  sgd: number;
  thb: number;
  try: number;
  twd: number;
  uah: number;
  usd: number;
  vef: number;
  vnd: number;
  xag: number;
  xau: number;
  xdr: number;
  xlm: number;
  xrp: number;
  yfi: number;
  zar: number;
  bits: number;
  link: number;
  sats: number;
}

export interface MarketData {
  current_price: CurrentPrice;
}

export interface ICoinGecko {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id?: any;
  block_time_in_minutes: number;
  hashing_algorithm: string;
  categories: string[];
  public_notice?: any;
  additional_notices: any[];
  country_origin: string;
  genesis_date: string;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  market_data: MarketData;
  status_updates: any[];
  last_updated: Date;
}

const URL = "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false"
export const COURSE_PRICE = 15


const fetcher = async (url:string) => {
  const res = await fetch(url)
  const json = await res.json() as ICoinGecko
  return json.market_data.current_price.usd ?? null
}

export const useEthPrice = () => {
  const {data, ...rest} = useSWR(
    URL,
    fetcher,
    { refreshInterval: 10000 }
  )
  const pricePerItem = (data && COURSE_PRICE / Number(data)) ?? 0
  const perItem = Number.parseFloat(pricePerItem.toFixed(6))
  return { eth: { data, perItem, ...rest}}
}