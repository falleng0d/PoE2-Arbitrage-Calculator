import axios, { AxiosInstance } from 'axios';

// Base API configuration
const BASE_URL = 'https://poe2scout.com/api';

// Type definitions
export interface Category {
  id: number;
  apiId: string;
  label: string;
  icon: string;
}

export interface CategoriesResponse {
  unique_categories: Category[];
  currency_categories: Category[];
}

export interface League {
  value: string;
  divinePrice: number;
  chaosDivinePrice: number;
}

export interface Filter {
  display_name: string;
  category: string;
  identifier: string;
}

export interface ItemMetadata {
  name: string;
  base_type: string;
  icon: string;
  stack_size: number;
  max_stack_size: number | null;
  description: string;
  effect: string[];
}

export interface PriceLog {
  price: number;
  time: string;
  quantity: number;
}

export interface CurrencyItem {
  id: number;
  itemId: number;
  currencyCategoryId: number;
  apiId: string;
  text: string;
  categoryApiId: string;
  iconUrl: string;
  itemMetadata: ItemMetadata | null;
  priceLogs: PriceLog[];
  currentPrice: number;
}

export interface CurrencyResponse {
  currentPage: number;
  pages: number;
  total: number;
  items: CurrencyItem[];
}

export interface CurrencyQueryParams {
  page?: number;
  perPage?: number;
  league?: string;
  search?: string;
  referenceCurrency?: string;
}

export type CurrencyCategory = 
  | 'currency'
  | 'ritual'
  | 'fragments'
  | 'runes'
  | 'talismans'
  | 'essences'
  | 'ultimatum'
  | 'expedition'
  | 'vaultkeys'
  | 'breach'
  | 'abyss'
  | 'uncutgems'
  | 'lineagesupportgems'
  | 'delirium';

export function buildParams(params: CurrencyQueryParams) {
  return {
    page: 1,
    perPage: 100,
    league: DEFAULT_LEAGUE,
    referenceCurrency: DEFAULT_CURRENCY,
    ...params,
  }
}

export class Poe2ScoutClient {
  private client: AxiosInstance;

  constructor(baseURL: string = BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all available item categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    const response = await this.client.get<CategoriesResponse>('/items/categories');
    return response.data;
  }

  /**
   * Get all available leagues with pricing information
   */
  async getLeagues(): Promise<League[]> {
    const response = await this.client.get<League[]>('/leagues');
    return response.data;
  }

  /**
   * Get all available item filters for searching
   */
  async getFilters(): Promise<Filter[]> {
    const response = await this.client.get<Filter[]>('/items/filters');
    return response.data;
  }

  /**
   * Get currency items for a specific category
   */
  async getCurrency(
    category: CurrencyCategory,
    params: CurrencyQueryParams = {}
  ): Promise<CurrencyResponse> {
    const finalParams = buildParams(params);
    const queryParams = new URLSearchParams();

    queryParams.append('page', finalParams.page.toString());
    queryParams.append('perPage', finalParams.perPage.toString());
    queryParams.append('league', finalParams.league);
    if (finalParams.search) queryParams.append('search', finalParams.search);
    queryParams.append('referenceCurrency', finalParams.referenceCurrency);

    const response = await this.client.get<CurrencyResponse>(
      `/items/currency/${category}?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get standard currency items (Divine Orb, Chaos Orb, etc.)
   */
  async getStandardCurrency(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('currency', params);
  }

  /**
   * Get ritual omens
   */
  async getRitualOmens(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('ritual', params);
  }

  /**
   * Get fragments (map fragments, keys, etc.)
   */
  async getFragments(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('fragments', params);
  }

  /**
   * Get runes
   */
  async getRunes(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('runes', params);
  }

  /**
   * Get talismans
   */
  async getTalismans(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('talismans', params);
  }

  /**
   * Get essences
   */
  async getEssences(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('essences', params);
  }

  /**
   * Get ultimatum soul cores
   */
  async getUltimatum(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('ultimatum', params);
  }

  /**
   * Get expedition coinage & artifacts
   */
  async getExpedition(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('expedition', params);
  }

  /**
   * Get reliquary keys
   */
  async getVaultKeys(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('vaultkeys', params);
  }

  /**
   * Get breach items
   */
  async getBreach(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('breach', params);
  }

  /**
   * Get abyssal bones
   */
  async getAbyss(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('abyss', params);
  }

  /**
   * Get uncut gems
   */
  async getUncutGems(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('uncutgems', params);
  }

  /**
   * Get lineage support gems
   */
  async getLineageSupportGems(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('lineagesupportgems', params);
  }

  /**
   * Get delirium items
   */
  async getDelirium(params: CurrencyQueryParams = {}): Promise<CurrencyResponse> {
    return this.getCurrency('delirium', params);
  }

  /**
   * Search for items across all categories
   */
  async searchItems(
    searchTerm: string,
    params: CurrencyQueryParams = {},
    categories: CurrencyCategory[] = ['currency', 'ritual', 'fragments']
  ): Promise<{ category: CurrencyCategory; data: CurrencyResponse }[]> {
    const results = await Promise.all(
      categories.map(async (category) => {
        try {
          const data = await this.getCurrency(category, {
            ...params,
            search: searchTerm,
            perPage: params.perPage || 50,
          });
          return { category, data };
        } catch (error) {
          console.warn(`Failed to search in category ${category}:`, error);
          return {
            category,
            data: { currentPage: 1, pages: 0, total: 0, items: [] },
          };
        }
      })
    );

    return results.filter(result => result.data.items.length > 0);
  }
}

// Export a default instance
export const poe2scout = new Poe2ScoutClient();

// Common league names for convenience
export const LEAGUES = {
  RISE_OF_THE_ABYSSAL: 'Rise of the Abyssal',
  HC_RISE_OF_THE_ABYSSAL: 'HC Rise of the Abyssal',
  DAWN_OF_THE_HUNT: 'Dawn of the Hunt',
  HC_DAWN_OF_THE_HUNT: 'HC Dawn of the Hunt',
  STANDARD: 'Standard',
  HARDCORE: 'Hardcore',
} as const;

// Common reference currencies
export const REFERENCE_CURRENCIES = {
  EXALTED: 'exalted',
  DIVINE: 'divine',
  CHAOS: 'chaos',
} as const;

export const DEFAULT_LEAGUE = LEAGUES.RISE_OF_THE_ABYSSAL;
export const DEFAULT_CURRENCY = REFERENCE_CURRENCIES.EXALTED;
