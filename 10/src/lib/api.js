const BASE = "https://trafik.emilfolino.se";

/**
 * Hämtar alla stationer och gör dem sökbara via LocationSignature.
 * Returnerar en Map: LocationSignature -> { name, lat, lon }
 */
export async function fetchStationsMap() {
  const res = await fetch(`${BASE}/stations`);
  const { data } = await res.json();

  const map = new Map();

  for (const station of data) {
    const coords = parseWgs84(station?.Geometry?.WGS84);
    map.set(station.LocationSignature, {
      name: station.AdvertisedLocationName,
      lat: coords?.lat ?? null,
      lon: coords?.lon ?? null,
    });
  }

  return map;
}

/**
 * Hämtar alla försenade tåg (rådata från API:t, ej ihopkopplade ännu).
 */
export async function fetchDelayedTrains() {
  const res = await fetch(`${BASE}/delayed`);
  const { data } = await res.json();
  return data;
}

/**
 * Kopplar ihop försenade tåg med stationsdata via LocationSignature,
 * och räknar ut förseningen i minuter. Robust mot saknad/trasig data.
 */
export function joinTrainsWithStations(trains, stationsMap) {
  return trains
    .map((train) => {
      const station = stationsMap.get(train.LocationSignature);

      const delayMinutes = calculateDelayMinutes(
        train.AdvertisedTimeAtLocation,
        train.EstimatedTimeAtLocation,
      );

      return {
        activityId: train.ActivityId,
        trainIdent:
          train.AdvertisedTrainIdent ??
          train.OperationalTrainNumber ??
          "Okänt tåg",
        canceled: Boolean(train.Canceled),
        stationName:
          station?.name ?? train.LocationSignature ?? "Okänd station",
        lat: station?.lat ?? null,
        lon: station?.lon ?? null,
        fromLocation: train.FromLocation?.[0]?.LocationName ?? "",
        toLocation: train.ToLocation?.[0]?.LocationName ?? "",
        advertisedTime: train.AdvertisedTimeAtLocation ?? null,
        estimatedTime: train.EstimatedTimeAtLocation ?? null,
        delayMinutes,
        trainOwner: train.TrainOwner ?? "",
      };
    })
    .filter((t) => t.advertisedTime !== null); // Kasta bort poster utan tidsdata, kan inte visas meningsfullt
}

function calculateDelayMinutes(advertised, estimated) {
  if (!advertised || !estimated) return 0;

  const advertisedDate = new Date(advertised);
  const estimatedDate = new Date(estimated);

  if (isNaN(advertisedDate) || isNaN(estimatedDate)) return 0;

  const diffMs = estimatedDate - advertisedDate;
  return Math.round(diffMs / 60000);
}

function parseWgs84(wgs84String) {
  if (typeof wgs84String !== "string") return null;

  // Format: "POINT (15.840063951305682 57.67270729523255)" => lon lat
  const match = wgs84String.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return null;

  return {
    lon: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
}
