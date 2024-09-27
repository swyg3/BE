export interface GeocodingResponse {
    status: string;
    meta: {
      totalCount: number;
      page: number;
      count: number;
    };
    addresses: Array<{
      roadAddress: string;
      jibunAddress: string;
      englishAddress: string;
      addressElements: Array<{
        types: string[];
        longName: string;
        shortName: string;
        code: string;
      }>;
      x: string;
      y: string;
      distance: number;
    }>;
  }