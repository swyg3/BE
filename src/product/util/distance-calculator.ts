// src/utils/distance-calculator.util.ts

export class DistanceCalculator {
  private static readonly EARTH_RADIUS = 6371; // km
  private static readonly a = 6378137; // 지구의 장반경 (미터)
  private static readonly b = 6356752.314245; // 지구의 단반경 (미터)
  private static readonly f = 1 / 298.257223563; // 편평률

  public static vincentyDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const L = this.toRadians(lon2 - lon1);
    const U1 = Math.atan((1 - this.f) * Math.tan(this.toRadians(lat1)));
    const U2 = Math.atan((1 - this.f) * Math.tan(this.toRadians(lat2)));
    const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

    let lambda = L, lambdaP, iterLimit = 100;
    let sinLambda, cosLambda, sinSigma, cosSigma, sigma, sinAlpha, cosSqAlpha, cos2SigmaM;

    do {
      sinLambda = Math.sin(lambda);
      cosLambda = Math.cos(lambda);
      sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
      if (sinSigma === 0) return 0;
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      sigma = Math.atan2(sinSigma, cosSigma);
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      cosSqAlpha = 1 - sinAlpha * sinAlpha;
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
      if (isNaN(cos2SigmaM)) cos2SigmaM = 0;
      const C = this.f / 16 * cosSqAlpha * (4 + this.f * (4 - 3 * cosSqAlpha));
      lambdaP = lambda;
      lambda = L + (1 - C) * this.f * sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

    if (iterLimit === 0) return NaN;

    const uSq = cosSqAlpha * (this.a * this.a - this.b * this.b) / (this.b * this.b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
      B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    
    const distance = this.b * A * (sigma - deltaSigma);

    return distance / 1000; // 킬로미터로 변환
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}