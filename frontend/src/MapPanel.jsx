import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const initialCenter = [139.6917, 35.6895];
const emotionColorMap = {
  楽しい: '#facc15',
  喜び: '#22c55e',
  '不安・心配': '#a855f7',
  '怖い・恐怖': '#ef4444',
  '悲しい・寂しい': '#3b82f6',
};
const emotionOptions = [
  { label: '楽しい', value: 'happy', color: emotionColorMap['楽しい'] },
  { label: '喜び', value: 'joy', color: emotionColorMap['喜び'] },
  { label: '不安・心配', value: 'worry', color: emotionColorMap['不安・心配'] },
  { label: '怖い・恐怖', value: 'fear', color: emotionColorMap['怖い・恐怖'] },
  { label: '悲しい・寂しい', value: 'sad', color: emotionColorMap['悲しい・寂しい'] },
];
const areaEmotionOptions = [
  { label: '安心', value: 'safe', color: '#1dc9a8' },
  { label: '楽しい', value: 'happy', color: '#f4c95d' },
  { label: '不安', value: 'worry', color: '#9f7aea' },
  { label: '悲しい', value: 'sad', color: '#60a5fa' },
  { label: '怒り', value: 'angry', color: '#fb7185' },
];
const emotionPinAssetMap = {
  楽しい: '/images/emotions/happy_yellow.png',
  喜び: '/images/emotions/joy_green.png',
  '怖い・恐怖': '/images/emotions/anger_red.png',
  '不安・心配': '/images/emotions/fear_purple.png',
  '悲しい・寂しい': '/images/emotions/sad_blue.png',
  other_plusN: '/images/emotions/other_plusN.png',
  default: '/images/emotions/other_plusN.png',
};

const areaRankingByEmotion = {
  安全: [
    { area: 'A区', share: 41, count: 1284 },
    { area: 'B区', share: 37, count: 1105 },
    { area: 'C区', share: 31, count: 994 },
    { area: 'D区', share: 28, count: 880 },
    { area: 'E区', share: 22, count: 517 },
  ],
  安心: [
    { area: 'A区', share: 41, count: 1284 },
    { area: 'B区', share: 37, count: 1105 },
    { area: 'C区', share: 31, count: 994 },
    { area: 'D区', share: 28, count: 880 },
    { area: 'E区', share: 22, count: 517 },
  ],
  楽しい: [
    { area: 'C区', share: 39, count: 1027 },
    { area: 'A区', share: 35, count: 941 },
    { area: 'B区', share: 31, count: 876 },
    { area: 'D区', share: 24, count: 702 },
    { area: 'E区', share: 19, count: 493 },
  ],
  不安: [
    { area: 'E区', share: 42, count: 745 },
    { area: 'D区', share: 36, count: 633 },
    { area: 'B区', share: 28, count: 574 },
    { area: 'A区', share: 19, count: 431 },
    { area: 'C区', share: 14, count: 308 },
  ],
  悲しい: [
    { area: 'B区', share: 26, count: 502 },
    { area: 'E区', share: 23, count: 487 },
    { area: 'D区', share: 21, count: 464 },
    { area: 'A区', share: 17, count: 390 },
    { area: 'C区', share: 12, count: 281 },
  ],
};
const districtEmotionMap = {
  A区: { 安心: 41, 楽しい: 24, 不安: 12, 悲しい: 8, 怒り: 15 },
  B区: { 安心: 37, 楽しい: 26, 不安: 18, 悲しい: 10, 怒り: 9 },
  C区: { 安心: 31, 楽しい: 39, 不安: 14, 悲しい: 6, 怒り: 10 },
  D区: { 安心: 28, 楽しい: 21, 不安: 36, 悲しい: 9, 怒り: 6 },
  E区: { 安心: 22, 楽しい: 18, 不安: 42, 悲しい: 11, 怒り: 7 },
};
const normalizeEmotionToGroup = (label) => {
  if (label === '楽しい') return '楽しい';
  if (label === '喜び') return '喜び';
  if (label === '不安・心配') return '不安';
  if (label === '怖い・恐怖') return '怒り';
  if (label === '悲しい・寂しい') return '悲しい';
  if (label === '安心') return '安心';
  return label;
};

const emotionCommentTemplates = {
  楽しい: ['公園の雰囲気が明るくて、気分が上がりました。', '笑い声が多くて、少し元気が出ました。'],
  喜び: ['思い出の場所で、自然と笑顔がこぼれました。', '景色や音が心に残る、嬉しい時間でした。'],
  不安: ['暗くなってくる時間帯が少し気になりました。', '人通りが少なくて、少し不安を感じました。'],
  怒り: ['騒音や混雑が気になって、少しイライラしました。', '周辺の様子が落ち着かず、不快に感じました。'],
  悲しい: ['静かな空気がやや寂しさを感じさせました。', '景色が落ち着いて見えたので、少し憂いを感じました。'],
  安心: ['周囲が落ち着いていて、安心して歩けました。', '人が多く、安心して過ごせる場所でした。'],
};

function getCircleComments(point, fallbackEmotion = '楽しい') {
  const textList = Array.isArray(point?.comments) && point.comments.length > 0 ? point.comments : [];
  if (textList.length > 0) {
    return textList;
  }

  const emotionKey = normalizeEmotionToGroup(point?.emotion || fallbackEmotion || '楽しい');
  return (emotionCommentTemplates[emotionKey] || emotionCommentTemplates.楽しい).map((text) => ({
    emotion: emotionKey,
    text,
    time: '最近',
  }));
}

function resolveEmotionColor(label) {
  if (label === '不安') return emotionColorMap['不安・心配'];
  if (label === '怒り') return emotionColorMap['怖い・恐怖'];
  if (label === '悲しい') return emotionColorMap['悲しい・寂しい'];
  if (label === '安心') return emotionColorMap['楽しい'];
  if (label === 'other_plusN') return emotionColorMap['楽しい'];
  return emotionColorMap[label] ?? emotionColorMap['楽しい'];
}

function haversineDistanceMeters(a, b) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const [lngA, latA] = a;
  const [lngB, latB] = b;

  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);
  const latARad = toRadians(latA);
  const latBRad = toRadians(latB);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latARad) * Math.cos(latBRad) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

function getDominantEmotionLabel(centerPoint, points, radiusMeters) {
  const inRange = points.filter((point) => {
    if (!point?.coords || !centerPoint?.coords) return false;
    return haversineDistanceMeters(centerPoint.coords, point.coords) <= radiusMeters;
  });

  if (inRange.length === 0) {
    return normalizeEmotionToGroup(centerPoint?.emotion ?? '楽しい');
  }

  const counts = {};
  inRange.forEach((point) => {
    const key = normalizeEmotionToGroup(point.emotion || '楽しい');
    counts[key] = (counts[key] ?? 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  const [winnerLabel, winnerCount] = sorted[0];
  const secondCount = sorted[1]?.[1] ?? 0;
  const share = winnerCount / total;
  const secondShare = secondCount / total;

  const fallbackEmotion = normalizeEmotionToGroup(centerPoint?.emotion ?? '楽しい');

  if (sorted.length === 1) {
    return winnerLabel || fallbackEmotion;
  }

  if (share >= 0.6) {
    return winnerLabel;
  }

  if (share >= 0.45 && share - secondShare >= 0.2) {
    return winnerLabel;
  }

  return 'other_plusN';
}

function getDominantEmotionColor(centerPoint, points, radiusMeters) {
  const dominantLabel = getDominantEmotionLabel(centerPoint, points, radiusMeters);
  if (dominantLabel === 'other_plusN') {
    return resolveEmotionColor(normalizeEmotionToGroup(centerPoint?.emotion ?? '楽しい'));
  }

  return resolveEmotionColor(dominantLabel);
}

function getEmotionAssetKey(label) {
  const normalized = normalizeEmotionToGroup(label || '楽しい');
  if (normalized === 'other_plusN') return 'other_plusN';
  if (normalized === '不安') return '不安・心配';
  if (normalized === '怒り') return '怖い・恐怖';
  if (normalized === '悲しい') return '悲しい・寂しい';
  return normalized;
}

function getInRangeEmotionLabels(centerPoint, points, radiusMeters) {
  const inRange = points.filter((point) => {
    if (!point?.coords || !centerPoint?.coords) return false;
    return haversineDistanceMeters(centerPoint.coords, point.coords) <= radiusMeters;
  });

  return [...new Set(inRange.map((point) => normalizeEmotionToGroup(point.emotion || '楽しい')))].filter(Boolean);
}

function clusterNearbyEmotionPoints(points, radiusMeters) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  const clusters = [];

  points.forEach((point) => {
    if (!point?.coords) {
      return;
    }

    const existingCluster = clusters.find((cluster) => {
      if (!cluster.center) {
        return false;
      }
      const centerDistance = haversineDistanceMeters(cluster.center, point.coords);
      return centerDistance <= Math.max(25, radiusMeters * 0.35);
    });

    if (existingCluster) {
      existingCluster.points.push(point);
      const totalLng = existingCluster.center[0] * existingCluster.points.length + point.coords[0];
      const totalLat = existingCluster.center[1] * existingCluster.points.length + point.coords[1];
      const nextCount = existingCluster.points.length + 1;
      existingCluster.center = [totalLng / nextCount, totalLat / nextCount];
      return;
    }

    clusters.push({
      center: point.coords,
      points: [point],
    });
  });

  return clusters.map((cluster) => {
    const allClusterPoints = cluster.points;
    const uniqueEmotionLabels = [...new Set(allClusterPoints.map((item) => normalizeEmotionToGroup(item.emotion || '楽しい')))].filter(Boolean);
    const dominantEmotion = getDominantEmotionLabel(
      { coords: cluster.center, emotion: allClusterPoints[0].emotion },
      allClusterPoints,
      radiusMeters
    );

    const aggregated = {
      ...allClusterPoints[0],
      coords: cluster.center,
      name: allClusterPoints[0].name,
      emotion: uniqueEmotionLabels.length > 1 && dominantEmotion === 'other_plusN' ? 'other_plusN' : dominantEmotion,
      clusterPoints: allClusterPoints,
      comments: allClusterPoints.flatMap((item) => getCircleComments(item, item.emotion || '楽しい')),
    };

    return aggregated;
  });
}

const scaleSteps = [
  { label: '5km', radius: 5000, zoom: 10.5 },
  { label: '1km', radius: 1000, zoom: 12.5 },
  { label: '100m', radius: 70, zoom: 15.5 },
  { label: '20m', radius: 20, zoom: 17.5 },
];

function getRadiusForScaleIndex(index) {
  const safeIndex = clampIndex(index);
  return scaleSteps[safeIndex].radius;
}

function metersToPixelsAtZoom(meters, latitude, zoom) {
  const earthCircumferenceMeters = 40075016.686;
  const metersPerPixel = (earthCircumferenceMeters * Math.cos((latitude * Math.PI) / 180)) / (256 * Math.pow(2, zoom));
  return Math.max(6, meters / metersPerPixel);
}

function getRadiusForZoom(zoom) {
  if (zoom >= 17.0) return 20;
  if (zoom >= 15.0) return 70;
  if (zoom >= 12.0) return 1000;
  return 5000;
}

function normalizeGeocodeText(value = '') {
  return value
    .toLowerCase()
    .replace(/[（）()\[\]{}]/g, '')
    .replace(/[.,/\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFeatureMatchScore(query, feature) {
  const placeTypes = Array.isArray(feature.place_type) ? feature.place_type.join(' ') : (feature.place_type || '');
  const rawCandidates = [
    feature.text,
    feature.place_name,
    feature.address,
    feature.properties?.short_code,
    feature.properties?.category,
  ].filter(Boolean);

  const normalizedQuery = normalizeGeocodeText(query);
  const firstName = rawCandidates[0] ? rawCandidates[0].split(',')[0] : '';
  const placeNameText = rawCandidates.join(' ');
  const normalizedPlaceName = normalizeGeocodeText(placeNameText);
  const normalizedFirstName = normalizeGeocodeText(firstName);

  let score = 0;

  if (normalizedPlaceName === normalizedQuery) {
    score += 200;
  }
  if (normalizedFirstName === normalizedQuery) {
    score += 180;
  }
  if (normalizedPlaceName.includes(normalizedQuery)) {
    score += 120;
  }
  if (normalizedFirstName.includes(normalizedQuery)) {
    score += 100;
  }
  if (normalizedQuery.includes(normalizedFirstName)) {
    score += 45;
  }

  if (placeTypes.includes('poi')) {
    score += 30;
  }
  if (placeTypes.includes('address')) {
    score += 20;
  }
  if (placeTypes.includes('place')) {
    score += 10;
  }

  if (/駅|station/.test(normalizedQuery) && placeTypes.includes('poi')) {
    score += 25;
  }
  if (/市|city|区|district|町|town/.test(normalizedQuery) && placeTypes.includes('place')) {
    score += 20;
  }

  return score;
}

function pickBestGeocodeCandidate(query, features) {
  if (!Array.isArray(features) || features.length === 0) {
    return null;
  }

  return features.reduce((best, feature) => {
    const score = getFeatureMatchScore(query, feature);
    if (!best || score > best.score) {
      return { feature, score };
    }
    return best;
  }, null)?.feature ?? features[0];
}

async function findPlaceCoordinatesByMapboxSearch(place) {
  const trimmedPlace = place.trim();
  if (!trimmedPlace) {
    throw new Error('場所名を入力してください');
  }

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodeURIComponent(trimmedPlace)}&country=jp&language=ja&limit=5&access_token=${MAPBOX_TOKEN}`
  );

  if (!response.ok) {
    throw new Error('Mapbox Search API の取得に失敗しました');
  }

  const data = await response.json();
  console.log('Mapbox Search results:', data);

  if (!data.features || data.features.length === 0) {
    throw new Error('該当する場所が見つかりませんでした');
  }

  const result = data.features[0];
  const [lng, lat] = result.geometry.coordinates;

  return {
    lng,
    lat,
    placeName: result.properties?.name || result.text || result.place_name || trimmedPlace,
  };
}

async function geocodePlace(place, accessToken) {
  const trimmedPlace = place.trim();
  if (!trimmedPlace) {
    throw new Error('場所名を入力してください');
  }

  const encodedPlace = encodeURIComponent(trimmedPlace);
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedPlace}.json?country=jp&language=ja&limit=5&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('位置の取得に失敗しました');
  }

  const data = await response.json();
  console.log('Mapbox geocoding response:', trimmedPlace, data);
  console.log(
    'Mapbox geocoding candidates:',
    (data.features || []).map((feature) => ({
      place_name: feature.place_name,
      text: feature.text,
      place_type: feature.place_type,
      coordinates: feature.geometry?.coordinates,
      relevance: feature.relevance,
      context: feature.context || [],
    }))
  );

  if (!data.features || data.features.length === 0) {
    throw new Error('該当する場所が見つかりませんでした');
  }

  const feature = pickBestGeocodeCandidate(trimmedPlace, data.features);
  console.log('Mapbox selected feature:', feature);

  const [lng, lat] = feature.geometry.coordinates;
  return { lng, lat, placeName: feature.place_name || feature.text || trimmedPlace };
}

function clampIndex(index) {
  return Math.min(scaleSteps.length - 1, Math.max(0, index));
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.body.appendChild(script);
  });
}

function loadStylesheet(href) {
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function MapPanel() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const scaleIndexRef = useRef(0);
  const searchInputRef = useRef(null);
  const wheelThrottleRef = useRef(0);
  const [scaleIndex, setScaleIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedAreaEmotion, setSelectedAreaEmotion] = useState('安心');
  const [selectedRegion, setSelectedRegion] = useState('A区');
  const [mypostSort, setMypostSort] = useState('新しい順');
  const [regionEmotionStats, setRegionEmotionStats] = useState(districtEmotionMap);
  const [textareaText, setTextareaText] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [postPlaceName, setPostPlaceName] = useState('');
  const [isMapPlaceSelectionMode, setIsMapPlaceSelectionMode] = useState(false);
  const [hidePlaceInputForSelection, setHidePlaceInputForSelection] = useState(false);
  const [representativePoints, setRepresentativePoints] = useState([]);
  const [postedEmotionPoints, setPostedEmotionPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const mapPlaceSelectionModeRef = useRef(false);
  const generatedDummyIdsRef = useRef([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadMunicipalityCenters() {
      try {
        const response = await fetch('/data/region-areas.json');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (isCancelled) {
          return;
        }

        const samplePoints = (Array.isArray(data) ? data : []).map((item, index) => ({
          id: `${item.name || 'municipality'}-${index}`,
          name: item.name,
          emotion: '楽しい',
          color: '#facc15',
          coords: [Number(item.lng), Number(item.lat)],
          radiusMeters: 5000,
          comments: getCircleComments({ emotion: '楽しい' }, '楽しい'),
        }));

        setRepresentativePoints(samplePoints);
        setPostedEmotionPoints([]);
      } catch (error) {
        console.warn('Failed to load municipality center data:', error);
      }
    }

    loadMunicipalityCenters();

    return () => {
      isCancelled = true;
    };
  }, []);

  const myPosts = [
    { id: 1, emotion: '不安', place: 'サンプル駅前広場', comment: '夜は帰り道が少し不安になる。', date: '2026/10/12 18:40', color: '#ef4444' },
    { id: 2, emotion: '安心', place: '川沿いの遊歩道', comment: '朝の散歩が気持ちよく、少し安心した。', date: '2026/10/11 07:55', color: '#22c55e' },
    { id: 3, emotion: '楽しい', place: '中央公園', comment: '子どもたちの笑い声が良い気分にさせる。', date: '2026/10/06 13:20', color: '#facc15' },
    { id: 4, emotion: '感動', place: '星屑デッキ', comment: '夕景がきれいで胸が熱くなった。', date: '2026/10/30 17:45', color: '#f97316' },
    { id: 5, emotion: '悲しい', place: '旧商店街', comment: '店が閉まっていて少し寂しさを感じた。', date: '2026/09/22 15:10', color: '#3b82f6' },
  ];

  const buildPlaceData = (placeName, coords = null) => ({
    name: placeName,
    coords,
    photo: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    emotions: [
      { label: '楽しい', value: 18, color: '#facc15' },
      { label: '喜び', value: 9, color: '#22c55e' },
      { label: '不安・心配', value: 7, color: '#a78bfa' },
      { label: '怖い・恐怖', value: 4, color: '#f87171' },
      { label: '悲しい・寂しい', value: 6, color: '#60a5fa' },
    ],
    comments: [
      { emotion: '楽しい', time: '2026/10/12 18:40', text: '街灯が多くて、少し安心できます。' },
      { emotion: '喜び', time: '2026/10/11 17:55', text: '川沿いの景色がきれいで気分が良いです。' },
      { emotion: '怖い・恐怖', time: '2026/10/09 17:20', text: '夜道が暗くて、少し不安です。' },
    ],
  });

  useEffect(() => {
    scaleIndexRef.current = scaleIndex;
  }, [scaleIndex]);

  useEffect(() => {
    mapPlaceSelectionModeRef.current = isMapPlaceSelectionMode;
  }, [isMapPlaceSelectionMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mapboxgl) {
      return;
    }

    const refreshCircleLayer = () => {
      const currentZoom = map.getZoom();
      const centerLat = map.getCenter().lat;
      const targetRadiusMeters = getRadiusForScaleIndex(scaleIndexRef.current);

      if (map.__emotionPinMarkers) {
        map.__emotionPinMarkers.forEach((marker) => marker.remove());
        delete map.__emotionPinMarkers;
      }

      if (map.getLayer('posted-emotion-layer')) {
        map.removeLayer('posted-emotion-layer');
      }
      if (map.getSource('posted-emotion-source')) {
        map.removeSource('posted-emotion-source');
      }

      const isFiveKmScale = scaleIndexRef.current === 0;
      const allVisiblePoints = [...representativePoints, ...postedEmotionPoints];
      const visiblePoints = isFiveKmScale ? representativePoints : allVisiblePoints;

      if (visiblePoints.length === 0) {
        return;
      }

      const shouldClusterAtOneKm = scaleIndexRef.current === 1;
      const shouldClusterAtCloseZoom = scaleIndexRef.current >= 2;
      const fiveKmDisplayPoints = isFiveKmScale
        ? representativePoints.map((point) => ({
            ...point,
            clusterPoints: allVisiblePoints.filter((candidate) => haversineDistanceMeters(point.coords, candidate.coords) <= targetRadiusMeters),
            emotion: getDominantEmotionLabel(point, allVisiblePoints, targetRadiusMeters),
          }))
        : [];
      const aggregatedVisiblePoints = isFiveKmScale
        ? fiveKmDisplayPoints
        : shouldClusterAtOneKm || shouldClusterAtCloseZoom
          ? clusterNearbyEmotionPoints(visiblePoints, targetRadiusMeters)
          : visiblePoints;

      const circleGeoJson = {
        type: 'FeatureCollection',
        features: aggregatedVisiblePoints.map((point) => {
          const sourcePoints = isFiveKmScale
            ? allVisiblePoints
            : (shouldClusterAtOneKm || shouldClusterAtCloseZoom) && point.clusterPoints && point.clusterPoints.length > 1
              ? point.clusterPoints
              : [point];
          const dominantColor = getDominantEmotionColor(point, sourcePoints, targetRadiusMeters);

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: point.coords,
            },
            properties: {
              color: dominantColor,
              radius: metersToPixelsAtZoom(targetRadiusMeters, centerLat, currentZoom),
              name: point.name,
              emotion: point.emotion,
              pinIcon: emotionPinAssetMap[point.emotion] ?? emotionPinAssetMap.default,
            },
          };
        }),
      };

      map.addSource('posted-emotion-source', {
        type: 'geojson',
        data: circleGeoJson,
      });

      map.addLayer({
        id: 'posted-emotion-layer',
        type: 'circle',
        source: 'posted-emotion-source',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.78,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      const markerPoints = isFiveKmScale ? fiveKmDisplayPoints : (shouldClusterAtOneKm || shouldClusterAtCloseZoom ? aggregatedVisiblePoints : visiblePoints);
      const markerEls = markerPoints.map((point) => {
        const pin = document.createElement('div');
        pin.className = 'emotion-pin-marker';
        pin.style.cursor = 'pointer';

        const clusterPoints = point.clusterPoints || [point];
        const clusterEmotionGroups = [...new Set(clusterPoints.map((item) => normalizeEmotionToGroup(item.emotion || '楽しい')))].filter(Boolean);
        const isMixedCluster = clusterPoints.length > 1 && clusterEmotionGroups.length > 1;
        const markerEmotion = isMixedCluster ? 'other_plusN' : getDominantEmotionLabel(point, clusterPoints, targetRadiusMeters);
        pin.title = `${point.name} - ${markerEmotion}`;

        if (markerEmotion === 'other_plusN') {
          const mixedPin = document.createElement('div');
          mixedPin.className = 'emotion-pin-mixed';

          const emotionList = clusterEmotionGroups.slice(0, 4);
          const remainingCount = Math.max(0, clusterPoints.length - emotionList.length);

          const strip = document.createElement('div');
          strip.className = 'emotion-pin-mixed-strip';

          emotionList.forEach((emotionLabel) => {
            const mini = document.createElement('div');
            mini.className = 'emotion-pin-mini';

            const miniImg = document.createElement('img');
            miniImg.src = emotionPinAssetMap[getEmotionAssetKey(emotionLabel)] ?? emotionPinAssetMap.default;
            miniImg.alt = emotionLabel;
            miniImg.className = 'emotion-pin-mini-image';
            mini.appendChild(miniImg);
            strip.appendChild(mini);
          });

          const plusBadge = document.createElement('div');
          plusBadge.className = 'emotion-pin-plus';
          plusBadge.textContent = remainingCount > 0 ? `+${remainingCount}` : '+N';
          mixedPin.append(strip, plusBadge);
          pin.appendChild(mixedPin);
        } else {
          const img = document.createElement('img');
          img.src = emotionPinAssetMap[getEmotionAssetKey(markerEmotion)] ?? emotionPinAssetMap.default;
          img.alt = markerEmotion;
          img.className = 'emotion-pin-image';
          pin.appendChild(img);
        }

        pin.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!point?.coords || !point?.name) return;
          setSelectedPlace(buildPlaceData(point.name, point.coords));
        });

        const marker = new window.mapboxgl.Marker({
          element: pin,
          anchor: 'center',
        })
          .setLngLat(point.coords)
          .addTo(map);

        return marker;
      });

      map.__emotionPinMarkers = markerEls;
    };

    refreshCircleLayer();
    map.on('zoomend', refreshCircleLayer);

    return () => {
      map.off('zoomend', refreshCircleLayer);
      if (map.__emotionPinMarkers) {
        map.__emotionPinMarkers.forEach((marker) => marker.remove());
        delete map.__emotionPinMarkers;
      }
      if (map.getLayer('posted-emotion-layer')) {
        map.removeLayer('posted-emotion-layer');
      }
      if (map.getSource('posted-emotion-source')) {
        map.removeSource('posted-emotion-source');
      }
    };
  }, [postedEmotionPoints, representativePoints]);

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      try {
        loadStylesheet('https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css');
        await loadScript('https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-language@1.0.0/index.js');

        if (!isMounted || !mapContainerRef.current || !window.mapboxgl) return;

        window.mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new window.mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: scaleSteps[0].zoom,
          minZoom: 5,
          maxZoom: 18,
          pitchWithRotate: false,
          dragRotate: false,
          touchZoomRotate: true,
        });

        map.scrollZoom.disable();
        map.doubleClickZoom.disable();
        mapRef.current = map;

        if (window.MapboxLanguage) {
          map.addControl(new window.MapboxLanguage({ defaultLanguage: 'ja' }));
        }

        const setZoomLevel = (nextIndex, duration = 220) => {
          const safeIndex = clampIndex(nextIndex);
          scaleIndexRef.current = safeIndex;
          setScaleIndex(safeIndex);
          map.flyTo({
            zoom: scaleSteps[safeIndex].zoom,
            duration,
            essential: true,
          });
        };

        map.on('click', (event) => {
          if (!mapPlaceSelectionModeRef.current) {
            return;
          }

          const { lng, lat } = event.lngLat;
          const placeName = `地図上の場所 (${lng.toFixed(3)}, ${lat.toFixed(3)})`;
          setSelectedPlace(buildPlaceData(placeName, [lng, lat]));
          setPostPlaceName('');
          setHidePlaceInputForSelection(true);
          setIsMapPlaceSelectionMode(false);
          setIsPosting(true);
        });

        map.on('click', 'posted-emotion-layer', (event) => {
          if (mapPlaceSelectionModeRef.current) {
            return;
          }

          const feature = event.features?.[0];
          if (!feature) {
            return;
          }

          const pointName = feature.properties?.name || '感情の円';
          const emotionName = feature.properties?.emotion || '楽しい';
          const pointCandidates = [...representativePoints, ...postedEmotionPoints];
          const matchedPoint = pointCandidates.find((point) => {
            if (!point?.coords) return false;
            if (point.name !== pointName) return false;
            return haversineDistanceMeters(point.coords, event.lngLat.toArray()) < 30;
          }) || pointCandidates.find((point) => point.name === pointName) || {
            name: pointName,
            emotion: emotionName,
            comments: getCircleComments({ emotion: emotionName }, emotionName),
          };

          const comments = getCircleComments(matchedPoint, emotionName);
          const popupContent = `
            <div class="emotion-annotation-popup">
              <div class="emotion-annotation-title">${pointName}</div>
              <div class="emotion-annotation-label">${emotionName}</div>
              <div class="emotion-annotation-list">
                ${comments
                  .slice(0, 3)
                  .map(
                    (comment) => `
                      <div class="emotion-annotation-item">
                        <span class="emotion-annotation-badge">${comment.emotion || emotionName}</span>
                        <span class="emotion-annotation-time">${comment.time || '最近'}</span>
                        <p>${comment.text || ''}</p>
                      </div>`
                  )
                  .join('')}
              </div>
            </div>
          `;

          new window.mapboxgl.Popup({ closeButton: true, maxWidth: '240px' })
            .setLngLat(event.lngLat)
            .setHTML(popupContent)
            .addTo(map);
        });

        const mapCanvas = map.getCanvas();
        mapCanvas.addEventListener(
          'wheel',
          (event) => {
            event.preventDefault();
            const now = Date.now();
            if (now - wheelThrottleRef.current < 160) {
              return;
            }
            wheelThrottleRef.current = now;

            const direction = event.deltaY < 0 ? 1 : -1;
            const currentIndex = scaleIndexRef.current;

            if (direction > 0) {
              if (currentIndex === scaleSteps.length - 1) return;
              setZoomLevel(currentIndex + 1, 180);
              return;
            }

            if (currentIndex === 0) return;
            setZoomLevel(currentIndex - 1, 180);
          },
          { passive: false }
        );

        setZoomLevel(0, 0);
      } catch (error) {
        console.error('Mapbox initialization failed:', error);
      }
    }

    initializeMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const changeScale = (nextIndex, duration = 220) => {
    if (!mapRef.current) return;

    const safeIndex = clampIndex(nextIndex);
    scaleIndexRef.current = safeIndex;
    setScaleIndex(safeIndex);
    mapRef.current.flyTo({
      zoom: scaleSteps[safeIndex].zoom,
      duration,
      essential: true,
    });
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!mapRef.current) return;
    const place = searchText.trim();

    if (!place) {
      setStatus('場所を入力してください');
      setStatusType('error');
      setSearchSuggestions([]);
      return;
    }

    try {
      setStatus('場所を検索しています...');
      setStatusType('');

      const result = await findPlaceCoordinatesByMapboxSearch(place);
      const targetIndex = scaleSteps.findIndex((step) => step.label === '100m');
      mapRef.current.flyTo({
        center: [result.lng, result.lat],
        zoom: scaleSteps[targetIndex].zoom,
        duration: 800,
        essential: true,
      });

      setScaleIndex(targetIndex);
      scaleIndexRef.current = targetIndex;
      setSelectedPlace(buildPlaceData(result.placeName, [result.lng, result.lat]));
      setStatus(`${result.placeName} を表示しました`);
      setStatusType('success');
      setSearchSuggestions([]);
    } catch (error) {
      setStatus(error.message || '検索に失敗しました');
      setStatusType('error');
      setSearchSuggestions([]);
    }
  };

  const fetchSuggestions = async (value) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 1) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?country=jp&language=ja&limit=5&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      console.log('Mapbox search candidates:', trimmed, data.features || []);
      setSearchSuggestions(data.features || []);
    } catch (error) {
      console.error('Mapbox search failed:', error);
      setSearchSuggestions([]);
    }
  };

  const handleSearchInput = (event) => {
    const value = event.target.value;
    setSearchText(value);
    fetchSuggestions(value);

    if (!value.trim()) {
      setStatus('');
      setStatusType('');
      setSearchSuggestions([]);
    }
  };

  const selectSuggestion = async (feature) => {
    const place = feature.place_name || feature.text || searchText;
    setSearchText(place);
    setSearchSuggestions([]);

    const [lng, lat] = feature.geometry.coordinates;
    const targetIndex = scaleSteps.findIndex((step) => step.label === '100m');
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: scaleSteps[targetIndex].zoom,
      duration: 800,
      essential: true,
    });

    setScaleIndex(targetIndex);
    scaleIndexRef.current = targetIndex;
    setSelectedPlace(buildPlaceData(place, [lng, lat]));
  };

  const openMapPlaceSelectionPost = () => {
    setHidePlaceInputForSelection(true);
    setIsMapPlaceSelectionMode(true);
    setIsPosting(false);
    setPostPlaceName('');
    setSelectedPlace(null);
    setStatus('地図をタップして場所を指定してください');
    setStatusType('');
  };

  const closePostModal = () => {
    setIsPosting(false);
    setIsMapPlaceSelectionMode(false);
    setHidePlaceInputForSelection(false);
    setPostPlaceName('');
    setStatus('');
    setStatusType('');
  };

  const handleSubmitPost = async () => {
    const typedPlaceName = postPlaceName.trim();
    const targetPlaceName = (typedPlaceName || selectedPlace?.name || '').trim();

    if (!targetPlaceName) {
      setStatus('投稿する場所名を入力してください');
      setStatusType('error');
      return;
    }

    if (!selectedEmotion) {
      setStatus('感情を選択してください');
      setStatusType('error');
      return;
    }

    const selectedEmotionData = emotionOptions.find((item) => item.value === selectedEmotion);
    if (!selectedEmotionData) {
      setStatus('選択した感情が見つかりません');
      setStatusType('error');
      return;
    }

    let resolvedPlaceName = targetPlaceName;
    let coordinates = selectedPlace?.coords || null;

    try {
      if (typedPlaceName) {
        const geocoded = await findPlaceCoordinatesByMapboxSearch(typedPlaceName);
        coordinates = [geocoded.lng, geocoded.lat];
        resolvedPlaceName = geocoded.placeName || typedPlaceName;

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: coordinates,
            zoom: Math.max(mapRef.current.getZoom(), scaleSteps[2].zoom),
            duration: 600,
            essential: true,
          });
        }
      } else if (!coordinates) {
        const geocoded = await findPlaceCoordinatesByMapboxSearch(targetPlaceName);
        coordinates = [geocoded.lng, geocoded.lat];
        resolvedPlaceName = geocoded.placeName || targetPlaceName;
      }

      if (!coordinates || coordinates.length !== 2) {
        throw new Error('その場所は地図上に存在しません。正しい場所名を入力してください');
      }
    } catch (error) {
      const message = error?.message || 'その場所は地図上に存在しません。正しい場所名を入力してください';
      setStatus(message);
      setStatusType('error');
      return;
    }

    const commentText = textareaText.trim() || `${selectedEmotionData.label}な気分でした。`;
    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const placeNameForCard = resolvedPlaceName;
    const nextPlaceData = buildPlaceData(placeNameForCard, coordinates);

    setSelectedPlace((current) => {
      const base = current || nextPlaceData;
      const updatedEmotions = base.emotions.map((item) =>
        item.label === selectedEmotionData.label
          ? { ...item, value: item.value + 1 }
          : item
      );

      return {
        ...base,
        coords: coordinates,
        name: placeNameForCard,
        emotions: updatedEmotions,
        comments: [{ emotion: selectedEmotionData.label, time: timestamp, text: commentText }, ...base.comments].slice(0, 8),
      };
    });

    setPostedEmotionPoints((current) => [
      ...current,
      {
        id: `${Date.now()}-${selectedEmotionData.label}`,
        name: placeNameForCard,
        emotion: selectedEmotionData.label,
        color: selectedEmotionData.color,
        coords: coordinates,
        radiusMeters: getRadiusForScaleIndex(scaleIndexRef.current),
        size: 42 + (selectedEmotionData.label === '不安・心配' ? 10 : 0),
        comments: [
          { emotion: selectedEmotionData.label, time: timestamp, text: commentText },
          { emotion: selectedEmotionData.label, time: '最近', text: 'この場所ではその感情が強く感じられています。' },
        ],
      },
    ]);

    setTextareaText('');
    setSelectedEmotion('');
    setPostPlaceName('');
    setHidePlaceInputForSelection(false);
    setIsPosting(false);

    const normalizedEmotion = normalizeEmotionToGroup(selectedEmotionData.label);
    setSelectedAreaEmotion(normalizedEmotion);

    setRegionEmotionStats((current) => {
      const regionKey = selectedRegion || 'A区';
      const base = { ...((current[regionKey] ?? districtEmotionMap[regionKey]) ?? { 安心: 0, 楽しい: 0, 不安: 0, 悲しい: 0, 怒り: 0 }) };
      const updated = {
        ...base,
        [normalizedEmotion]: (base[normalizedEmotion] ?? 0) + 1,
      };

      const total = Object.values(updated).reduce((sum, value) => sum + value, 0) || 1;
      const normalized = Object.fromEntries(
        Object.entries(updated).map(([key, value]) => [key, Number(((value / total) * 100).toFixed(1))])
      );

      return { ...current, [regionKey]: normalized };
    });

    setStatus(`${placeNameForCard}に${selectedEmotionData.label}の投稿を追加しました`);
    setStatusType('success');
  };

  const currentRegionEmotionStats = regionEmotionStats[selectedRegion] || districtEmotionMap[selectedRegion] || districtEmotionMap.A区;

  const handleGenerateTokyoDummyData = () => {
    const emotionOptionsPool = ['楽しい', '喜び', '不安・心配', '怖い・恐怖', '悲しい・寂しい'];
    const minLng = 139.5;
    const maxLng = 139.95;
    const minLat = 35.55;
    const maxLat = 35.95;

    const newDummyPoints = Array.from({ length: 1000 }, (_, index) => {
      const lng = minLng + Math.random() * (maxLng - minLng);
      const lat = minLat + Math.random() * (maxLat - minLat);
      const emotion = emotionOptionsPool[Math.floor(Math.random() * emotionOptionsPool.length)];

      return {
        id: `dummy-${Date.now()}-${index}`,
        name: `テスト投稿-${index + 1}`,
        emotion,
        color: emotionColorMap[emotion] || '#facc15',
        coords: [lng, lat],
        radiusMeters: 20,
        comments: [
          { emotion, time: 'テスト', text: 'ダミーデータによる仮投稿です' },
          { emotion, time: 'テスト', text: '擬似データで動作確認中です' },
        ],
      };
    });

    generatedDummyIdsRef.current = [...generatedDummyIdsRef.current, ...newDummyPoints.map((item) => item.id)];
    setPostedEmotionPoints((current) => [...current, ...newDummyPoints]);
    setStatus('東京都内にダミーデータ 1,000 件を追加しました');
    setStatusType('success');
  };

  const handleClearDummyData = () => {
    const dummyIds = new Set(generatedDummyIdsRef.current);
    setPostedEmotionPoints((current) => current.filter((point) => !dummyIds.has(point.id)));
    generatedDummyIdsRef.current = [];
    setStatus('ダミーデータを削除しました');
    setStatusType('success');
  };

  return (
    <div ref={mapContainerRef} className="map-container">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">感情の地層マップ</span>
          </div>

          <nav className="nav-menu" aria-label="Main navigation">
            <button
              type="button"
              className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              マップ
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              検索
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'area' ? 'active' : ''}`}
              onClick={() => setActiveTab('area')}
            >
              エリア別分析
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'myposts' ? 'active' : ''}`}
              onClick={() => setActiveTab('myposts')}
            >
              マイ投稿
            </button>
          </nav>
        </div>

        <div className="topbar-right">
          <div className="user-badge">2</div>
          <div className="user-name">山田花子</div>
          <button type="button" className="logout-button">ログアウト</button>
        </div>
      </header>

      {activeTab === 'search' ? (
        <div className="search-tab-view">
          <aside className="search-filter-panel">
            <div className="search-filter-header">
              <div className="filter-title">検索条件</div>
              <div className="filter-count-box">4</div>
            </div>

            <div className="filter-group">
              <label className="filter-label">場所・キーワードで検索</label>
              <input type="text" placeholder="場所・キーワードで検索" className="filter-input" />
              <div className="filter-hint">例: 駅前, 公園</div>
            </div>

            <div className="filter-group">
              <label className="filter-label">感情カテゴリ</label>
              <div className="emotion-checklist">
                <label><input type="checkbox" defaultChecked /> 楽しい</label>
                <label><input type="checkbox" defaultChecked /> 喜び</label>
                <label><input type="checkbox" defaultChecked /> 不安・心配</label>
                <label><input type="checkbox" defaultChecked /> 怖い・恐怖</label>
                <label><input type="checkbox" defaultChecked /> 悲しい・寂しい</label>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">投稿期間</label>
              <div className="date-row">
                <input type="text" value="2026/09/14" className="date-input" readOnly />
                <span>~</span>
                <input type="text" value="2026/10/14" className="date-input" readOnly />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">並び順</label>
              <div className="tag-row">
                <button type="button" className="filter-tag active">新しい順</button>
                <button type="button" className="filter-tag">古い順</button>
                <button type="button" className="filter-tag">感情順</button>
              </div>
            </div>

            <div className="filter-group">
              <button type="button" className="apply-button">この条件で検索</button>
            </div>
          </aside>

          <main className="search-result-panel">
            <div className="result-header">
              <div className="result-title">検索結果</div>
              <div className="result-count-box">24件</div>
              <button type="button" className="list-toggle">リスト</button>
            </div>

            <div className="result-list">
              {[
                { id: 11, emotion: '安心', title: 'サンプル駅前広場', text: '夜の街灯が多くて、安全に感じます。', date: '2026/10/12 18:40', color: '#4ade80' },
                { id: 12, emotion: '危険', title: 'サンプル大通り交差点', text: '歩道が狭く、車が多くて少し不安です。', date: '2026/10/12 17:00', color: '#f87171' },
                { id: 13, emotion: '不安', title: '川沿いの遊歩道', text: '人が少なく、暗い時間帯は不安を感じます。', date: '2026/10/11 19:25', color: '#a78bfa' },
                { id: 14, emotion: '楽しい', title: '公園中央広場', text: '音楽イベントがあって、明るい雰囲気でした。', date: '2026/10/11 16:20', color: '#facc15' },
                { id: 15, emotion: '安心', title: '市役所前の通り', text: '清潔感があり、落ち着いて歩けます。', date: '2026/10/09 12:15', color: '#4ade80' },
              ].map((item) => (
                <div key={item.id} className="result-item">
                  <div className="result-rank">{item.id}</div>
                  <div className="result-emotion-mark" style={{ background: item.color }} />
                  <div className="result-main">
                    <div className="result-title-row">
                      <strong>{item.title}</strong>
                      <span className="result-date">{item.date}</span>
                    </div>
                    <p>{item.text}</p>
                  </div>
                  <button type="button" className="map-link">地図で見る →</button>
                </div>
              ))}
            </div>
          </main>
        </div>
      ) : activeTab === 'area' ? (
        <div className="area-analysis-page">
          <div className="analysis-header">
            <div className="analysis-title">エリア別分析</div>
            <div className="analysis-selects">
              <select
                value={selectedAreaEmotion}
                onChange={(event) => setSelectedAreaEmotion(event.target.value)}
                className="analysis-select"
              >
                {areaEmotionOptions.map((item) => (
                  <option key={item.value} value={item.label}>{item.label}</option>
                ))}
              </select>
              <select
                value={selectedRegion}
                onChange={(event) => setSelectedRegion(event.target.value)}
                className="analysis-select"
              >
                {Object.keys(districtEmotionMap).map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="analysis-content">
            <aside className="analysis-ranking-panel">
              <div className="analysis-panel-header">
                <div className="panel-label">{selectedAreaEmotion}ランキング</div>
                <div className="panel-count">{areaRankingByEmotion[selectedAreaEmotion]?.length ?? 0}</div>
              </div>

              <div className="area-ranking-list">
                {(areaRankingByEmotion[selectedAreaEmotion] || []).map((item, index) => (
                  <div key={`${selectedAreaEmotion}-${item.area}`} className="area-ranking-row">
                    <div className="area-rank-badge">{index + 1}</div>
                    <div className="area-rank-line">
                      <div className="area-rank-meta">
                        <span className="area-name">{item.area}</span>
                        <span className="area-count">{item.count.toLocaleString()}件</span>
                      </div>
                      <div className="area-progress-track">
                        <span
                          className="area-progress-fill"
                          style={{ width: `${item.share}%`, background: areaEmotionOptions.find((emotion) => emotion.label === selectedAreaEmotion)?.color || '#1dc9a8' }}
                        />
                      </div>
                    </div>
                    <div className="area-percent">{item.share}%</div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="analysis-trend-panel">
              <div className="analysis-panel-header">
                <div className="panel-label">{selectedRegion}の感情傾向</div>
                <div className="panel-count">{currentRegionEmotionStats?.[selectedAreaEmotion] ?? 0}%</div>
              </div>

              <div className="trend-visualization">
                <div className="bubble-scene">
                  {Object.entries(currentRegionEmotionStats || {}).map(([label, value], index) => {
                    const color = areaEmotionOptions.find((item) => item.label === label)?.color || '#7dd3fc';
                    const size = 78 + value * 1.8;
                    const x = 26 + (index % 3) * 26;
                    const y = 22 + Math.floor(index / 3) * 28;

                    return (
                      <div
                        key={`${selectedRegion}-${label}`}
                        className="trend-bubble"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          background: color,
                          left: `${x}%`,
                          top: `${y}%`,
                          opacity: 0.72,
                        }}
                      >
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="trend-metric-grid">
                <div className="metric-card">
                  <span>投票数</span>
                  <strong>1,284件</strong>
                </div>
                <div className="metric-card">
                  <span>安心の割合</span>
                  <strong>{currentRegionEmotionStats?.安心 ?? 0}%</strong>
                </div>
                <div className="metric-card">
                  <span>不安の割合</span>
                  <strong>{currentRegionEmotionStats?.不安 ?? 0}%</strong>
                </div>
                <div className="metric-card wide-card">
                  <span>最も多い感情</span>
                  <strong>
                    {Object.entries(currentRegionEmotionStats || []).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '安心'}
                  </strong>
                </div>
              </div>

              <div className="emotion-breakdown">
                {Object.entries(currentRegionEmotionStats || [])
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, value]) => {
                    const color = areaEmotionOptions.find((item) => item.label === label)?.color || '#cbd5e1';

                    return (
                      <div key={`${selectedRegion}-breakdown-${label}`} className="breakdown-row">
                        <div className="breakdown-label">
                          <span className="breakdown-dot" style={{ background: color }} />
                          <span>{label}</span>
                        </div>
                        <div className="breakdown-track">
                          <span className="breakdown-fill" style={{ width: `${value}%`, background: color }} />
                        </div>
                        <strong>{value}%</strong>
                      </div>
                    );
                  })}
              </div>

              <div className="emotion-tag-row">
                {Object.entries(currentRegionEmotionStats || {}).map(([label, value]) => (
                  <div key={`${selectedRegion}-tag-${label}`} className="emotion-tag" style={{ background: areaEmotionOptions.find((item) => item.label === label)?.color || '#cbd5e1' }}>
                    {label} {value}%
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      ) : activeTab === 'myposts' ? (
        <div className="my-posts-page">
          <div className="my-posts-header">
            <div className="my-posts-title-wrap">
              <div className="my-posts-title">マイ投稿</div>
              <div className="my-posts-subtitle">自分が投稿した投稿は以下の通りです</div>
            </div>

            <div className="my-posts-actions">
              <div className="mini-count-box">5</div>
              <div className="mini-count-box">6</div>
              <div className="mini-count-box">3</div>
              <select
                value={mypostSort}
                onChange={(event) => setMypostSort(event.target.value)}
                className="myposts-sort"
              >
                <option>すべての投稿</option>
                <option>新しい順</option>
                <option>古い順</option>
              </select>
            </div>
          </div>

          <div className="myposts-table-shell">
            <table className="myposts-table">
              <thead>
                <tr>
                  <th>感情</th>
                  <th>場所</th>
                  <th>コメント</th>
                  <th>投稿日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {myPosts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="emotion-pill" style={{ background: item.color }}>
                        {item.emotion}
                      </span>
                    </td>
                    <td>{item.place}</td>
                    <td>{item.comment}</td>
                    <td>{item.date}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="action-button edit-button">編集</button>
                        <button type="button" className="action-button delete-button">削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="myposts-pagination">
            <button type="button" className="pager-button">‹</button>
            <button type="button" className="pager-button active">1</button>
            <button type="button" className="pager-button">2</button>
            <button type="button" className="pager-button">3</button>
            <button type="button" className="pager-button">10</button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="post-button"
            onClick={() => setIsPosting(true)}
          >
            感情を投稿する
          </button>

          {isPosting && (
            <div className="post-overlay" onClick={closePostModal}>
              <div className="post-modal" onClick={(event) => event.stopPropagation()}>
                <div className="post-header">
                  <h3>感情を投稿する</h3>
                  <button type="button" className="close-button" onClick={closePostModal}>
                    ×
                  </button>
                </div>

                {!hidePlaceInputForSelection && (
                  <>
                    <div className="post-step">1 場所を指定</div>
                    <div className="post-place-field">
                      <label htmlFor="post-place-name" className="post-field-label">場所名</label>
                      <input
                        id="post-place-name"
                        type="text"
                        value={postPlaceName}
                        onChange={(event) => setPostPlaceName(event.target.value)}
                        placeholder={selectedPlace ? selectedPlace.name : '例: 東京駅'}
                        className="post-place-input"
                      />
                    </div>
                    <button type="button" className="map-select-button" onClick={openMapPlaceSelectionPost}>
                      地図上をタップして感情を投稿する
                    </button>
                  </>
                )}

                {hidePlaceInputForSelection && (
                  <div className="post-step">1 場所を指定済み</div>
                )}

                <div className="post-step">2 今の感情を選ぶ</div>
                <div className="emotion-grid">
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion.value}
                      type="button"
                      className={`emotion-button ${selectedEmotion === emotion.value ? 'selected' : ''}`}
                      style={{ backgroundColor: selectedEmotion === emotion.value ? emotion.color : '#f3f4f6' }}
                      onClick={() => setSelectedEmotion(emotion.value)}
                    >
                      {emotion.label}
                    </button>
                  ))}
                </div>

                <div className="post-step">3 コメント</div>
                <textarea
                  value={textareaText}
                  onChange={(event) => setTextareaText(event.target.value)}
                  placeholder="そのとき感じたことを伝えてください"
                  maxLength={200}
                />

                <div className="post-footer">
                  <span>{textareaText.length}/200</span>
                  <div className="post-actions">
                    <button type="button" className="cancel-button" onClick={closePostModal}>
                      キャンセル
                    </button>
                    <button type="button" className="submit-button" onClick={handleSubmitPost}>
                      投稿する
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="search-panel" onSubmit={handleSearch}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={handleSearchInput}
              placeholder="場所を検索"
              aria-label="Place search"
            />
            <button type="submit">検索</button>
          </form>

          {searchSuggestions.length > 0 && (
            <div className="suggestion-list" role="listbox">
              {searchSuggestions.map((feature) => (
                <button
                  key={`${feature.id}-${feature.place_name}`}
                  type="button"
                  className="suggestion-item"
                  onClick={() => selectSuggestion(feature)}
                >
                  {feature.place_name}
                </button>
              ))}
            </div>
          )}

          {status && <div className={`search-status ${statusType}`}>{status}</div>}

          {selectedPlace && (
            <div className="info-panel">
              <div className="info-header">
                <div className="info-title">{selectedPlace.name}</div>
                <div className="info-header-actions">
                  <div className="info-score">{selectedPlace.emotions.reduce((sum, item) => sum + item.value, 0)}</div>
                  <button
                    type="button"
                    className="info-close-button"
                    aria-label="Close place details"
                    onClick={() => setSelectedPlace(null)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="info-image-wrap">
                <img src={selectedPlace.photo} alt={selectedPlace.name} className="info-image" />
              </div>

              <div className="info-section-title">この場所の感情</div>
              <div className="emotion-summary">
                <div className="combined-emotion-bar">
                  {selectedPlace.emotions.map((emotion) => {
                    const total = selectedPlace.emotions.reduce((sum, item) => sum + item.value, 0);
                    const width = total === 0 ? 0 : (emotion.value / total) * 100;
                    return (
                      <span
                        key={emotion.label}
                        className="combined-emotion-segment"
                        style={{ width: `${width}%`, background: emotion.color }}
                        title={`${emotion.label}: ${emotion.value}%`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="emotion-legend">
                {selectedPlace.emotions.map((emotion) => (
                  <div key={emotion.label} className="emotion-legend-item">
                    <span className="emotion-dot" style={{ background: emotion.color }} />
                    <span>{emotion.label}</span>
                    <span className="emotion-value">{emotion.value}</span>
                  </div>
                ))}
              </div>

              <div className="info-comment-block">
                <div className="info-section-title">コメント</div>
                <div className="comment-list">
                  {selectedPlace.comments.map((comment) => (
                    <div key={`${comment.time}-${comment.text}`} className="comment-item">
                      <div className="comment-header-line">
                        <span className="comment-emotion">{comment.emotion}</span>
                        <span className="comment-time">{comment.time}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="zoom-controls" aria-label="Map controls">
            <button
              type="button"
              className="location-button"
              aria-label="Current location"
              onClick={() => {
                if (!navigator.geolocation) {
                  setStatus('このブラウザでは現在地を取得できません');
                  setStatusType('error');
                  return;
                }

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    const targetIndex = scaleSteps.findIndex((step) => step.label === '100m');
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: scaleSteps[targetIndex].zoom,
                      duration: 800,
                      essential: true,
                    });
                    setScaleIndex(targetIndex);
                    scaleIndexRef.current = targetIndex;
                    setStatus('現在地を表示しました');
                    setStatusType('success');
                  },
                  () => {
                    setStatus('現在地の取得に失敗しました');
                    setStatusType('error');
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
            >
              ◎
            </button>
            <button
              type="button"
              className="zoom-button"
              aria-label="Zoom in"
              onClick={() => changeScale(scaleIndex + 1, 220)}
            >
              ＋
            </button>
            <button
              type="button"
              className="zoom-button"
              aria-label="Zoom out"
              onClick={() => changeScale(scaleIndex - 1, 220)}
            >
              －
            </button>
          </div>

          {import.meta.env.DEV && (
            <div
              style={{
                position: 'absolute',
                right: '18px',
                bottom: '92px',
                display: 'flex',
                gap: '8px',
                zIndex: 20,
              }}
            >
              <button
                type="button"
                onClick={handleGenerateTokyoDummyData}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 14px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                }}
              >
                ダミー 1万件生成
              </button>
              <button
                type="button"
                onClick={handleClearDummyData}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 14px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                }}
              >
                すぐ消す
              </button>
            </div>
          )}

          <div className="scale-panel" aria-label="Scale selector">
            {scaleSteps.map((step, index) => (
              <button
                key={step.label}
                type="button"
                className={`scale-button ${scaleIndex === index ? 'active' : ''}`}
                onClick={() => changeScale(index, 250)}
              >
                {step.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MapPanel;
