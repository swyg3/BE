interface Polygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export class DistanceCalculator {
  private static readonly EARTH_RADIUS = 6371; // km
  private static readonly a = 6378137; // 지구의 장반경 (미터)
  private static readonly b = 6356752.3142; // 지구의 단반경 (미터)
  private static readonly f = 1 / 298.257223563; // 편평률

  public static vincentyDistance(poly1: Polygon, poly2: Polygon): number {
    // 각 폴리곤의 중심점 계산
    const center1 = this.calculatePolygonCenter(poly1);
    const center2 = this.calculatePolygonCenter(poly2);

    const [lon1, lat1] = center1;
    const [lon2, lat2] = center2;

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

    const distanceInMeters = this.b * A * (sigma - deltaSigma);
    return Number((distanceInMeters / 1000).toFixed(1)); // 미터를 킬로미터로 변환하고 소수점 첫째 자리까지 반올림
  }

  private static calculatePolygonCenter(polygon: Polygon): [number, number] {
    const coordinates = polygon.coordinates[0]; // 첫 번째 링 사용
    let x = 0, y = 0, z = 0;

    for (const [lon, lat] of coordinates) {
      const latRad = this.toRadians(lat);
      const lonRad = this.toRadians(lon);
      x += Math.cos(latRad) * Math.cos(lonRad);
      y += Math.cos(latRad) * Math.sin(lonRad);
      z += Math.sin(latRad);
    }

    const total = coordinates.length;
    x = x / total;
    y = y / total;
    z = z / total;

    const centralLongitude = Math.atan2(y, x);
    const centralSquareRoot = Math.sqrt(x * x + y * y);
    const centralLatitude = Math.atan2(z, centralSquareRoot);

    return [this.toDegrees(centralLongitude), this.toDegrees(centralLatitude)];
  }

  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  public static createPolygonFromCoordinates(lat: number, lon: number): Polygon {
    return {
      type: 'Polygon',
      coordinates: [[[lon, lat], [lon, lat], [lon, lat], [lon, lat]]]
    };
  }
}