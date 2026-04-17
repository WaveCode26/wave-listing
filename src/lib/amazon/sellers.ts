import { spApi } from './client'

interface MarketplaceParticipation {
  marketplace: {
    id: string
    name: string
    countryCode: string
    defaultCurrencyCode: string
    defaultLanguageCode: string
    domainName: string
  }
  participation: {
    isParticipating: boolean
    hasSuspendedListings: boolean
  }
}

interface SellerParticipationsResponse {
  payload: MarketplaceParticipation[]
}

export async function getMarketplaceParticipations() {
  return spApi<SellerParticipationsResponse>('/sellers/v1/marketplaceParticipations')
}
