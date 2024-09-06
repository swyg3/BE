import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BusinessNumberVerificationService {
  private readonly API_URL = 'https://api.odcloud.kr/api/nts-businessman/v1/status';
  private readonly API_KEY = process.env.BUSINESS_NUMBER_API_KEY;

  async verify(businessNumber: string): Promise<boolean> {
    try {
      const response = await axios.post(this.API_URL, {
        b_no: [businessNumber]
      }, {
        params: {
          serviceKey: this.API_KEY
        }
      });

      if (response.data && response.data.data && response.data.data[0]) {
        return response.data.data[0].b_stt === '01'; // 영업 중
      }
      return false;
    } catch (error) {
      console.error('사업자 등록번호 확인 중 오류 발생:', error);
      return false;
    }
  }
}