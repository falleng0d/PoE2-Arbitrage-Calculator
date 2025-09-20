import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { Poe2ScoutClient, LEAGUES, REFERENCE_CURRENCIES } from './poe2scout.ts';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Poe2ScoutClient', () => {
  let client: Poe2ScoutClient;
  let mockAxiosInstance: typeof mockedAxios;

  beforeEach(() => {
    mockAxiosInstance = {
      get: vi.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new Poe2ScoutClient();
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockResponse = {
        data: {
          unique_categories: [
            {
              id: 1,
              apiId: 'accessory',
              label: 'Accessories',
              icon: 'https://example.com/icon.png',
            },
          ],
          currency_categories: [
            {
              id: 1,
              apiId: 'currency',
              label: 'Currency',
              icon: 'https://example.com/currency.png',
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getCategories();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/items/categories');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getLeagues', () => {
    it('should fetch leagues successfully', async () => {
      const mockResponse = {
        data: [
          {
            value: 'Rise of the Abyssal',
            divinePrice: 277.77,
            chaosDivinePrice: 38.32,
          },
        ],
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getLeagues();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/leagues');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrency', () => {
    it('should fetch currency with correct parameters', async () => {
      const mockResponse = {
        data: {
          currentPage: 1,
          pages: 8,
          total: 37,
          items: [
            {
              id: 18,
              itemId: 295,
              currencyCategoryId: 1,
              apiId: 'mirror',
              text: 'Mirror of Kalandra',
              categoryApiId: 'currency',
              iconUrl: 'https://example.com/mirror.png',
              itemMetadata: null,
              priceLogs: [],
              currentPrice: 212221.73,
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params = {
        league: LEAGUES.RISE_OF_THE_ABYSSAL,
        referenceCurrency: REFERENCE_CURRENCIES.EXALTED,
        page: 1,
        perPage: 100,
        search: 'mirror',
      };

      const result = await client.getCurrency('currency', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/items/currency/currency?page=1&perPage=100&league=Rise+of+the+Abyssal&search=mirror&referenceCurrency=exalted'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle optional parameters correctly', async () => {
      const mockResponse = {
        data: {
          currentPage: 1,
          pages: 1,
          total: 0,
          items: [],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params = {
        league: LEAGUES.STANDARD,
        referenceCurrency: REFERENCE_CURRENCIES.DIVINE,
      };

      await client.getCurrency('ritual', params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/items/currency/ritual?page=1&perPage=100&league=Standard&referenceCurrency=divine'
      );
    });
  });

  describe('convenience methods', () => {
    it('should call getCurrency with correct category for getStandardCurrency', async () => {
      const spy = vi.spyOn(client, 'getCurrency').mockResolvedValue({
        currentPage: 1,
        pages: 1,
        total: 0,
        items: [],
      });

      const params = {
        league: LEAGUES.RISE_OF_THE_ABYSSAL,
        referenceCurrency: REFERENCE_CURRENCIES.EXALTED,
      };

      await client.getStandardCurrency(params);

      expect(spy).toHaveBeenCalledWith('currency', params);
    });

    it('should call getCurrency with correct category for getRitualOmens', async () => {
      const spy = vi.spyOn(client, 'getCurrency').mockResolvedValue({
        currentPage: 1,
        pages: 1,
        total: 0,
        items: [],
      });

      const params = {
        league: LEAGUES.RISE_OF_THE_ABYSSAL,
        referenceCurrency: REFERENCE_CURRENCIES.EXALTED,
      };

      await client.getRitualOmens(params);

      expect(spy).toHaveBeenCalledWith('ritual', params);
    });
  });

  describe('searchItems', () => {
    it('should search across multiple categories', async () => {
      const mockCurrencyResponse = {
        currentPage: 1,
        pages: 1,
        total: 1,
        items: [
          {
            id: 1,
            itemId: 1,
            currencyCategoryId: 1,
            apiId: 'chaos',
            text: 'Chaos Orb',
            categoryApiId: 'currency',
            iconUrl: 'https://example.com/chaos.png',
            itemMetadata: null,
            priceLogs: [],
            currentPrice: 1,
          },
        ],
      };

      const mockRitualResponse = {
        currentPage: 1,
        pages: 1,
        total: 0,
        items: [],
      };

      const spy = vi.spyOn(client, 'getCurrency')
        .mockResolvedValueOnce(mockCurrencyResponse)
        .mockResolvedValueOnce(mockRitualResponse);

      const results = await client.searchItems(
        'chaos',
        {
          league: LEAGUES.RISE_OF_THE_ABYSSAL,
          referenceCurrency: REFERENCE_CURRENCIES.EXALTED,
        },
        ['currency', 'ritual']
      );

      expect(spy).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(1); // Only currency category has results
      expect(results[0].category).toBe('currency');
      expect(results[0].data).toEqual(mockCurrencyResponse);
    });
  });
});

describe('Constants', () => {
  it('should export correct league names', () => {
    expect(LEAGUES.RISE_OF_THE_ABYSSAL).toBe('Rise of the Abyssal');
    expect(LEAGUES.HC_RISE_OF_THE_ABYSSAL).toBe('HC Rise of the Abyssal');
    expect(LEAGUES.STANDARD).toBe('Standard');
  });

  it('should export correct reference currencies', () => {
    expect(REFERENCE_CURRENCIES.EXALTED).toBe('exalted');
    expect(REFERENCE_CURRENCIES.DIVINE).toBe('divine');
    expect(REFERENCE_CURRENCIES.CHAOS).toBe('chaos');
  });
});
