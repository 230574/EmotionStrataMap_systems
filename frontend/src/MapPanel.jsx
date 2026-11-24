import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const initialCenter = [139.6917, 35.6895];
const TOKYO_MUNICIPALITY_CENTERS = [
  { name: '千代田区', lat: 35.6938, lng: 139.7530 },
  { name: '中央区', lat: 35.6669, lng: 139.7708 },
  { name: '港区', lat: 35.6581, lng: 139.7516 },
  { name: '新宿区', lat: 35.6938, lng: 139.7034 },
  { name: '文京区', lat: 35.7081, lng: 139.7520 },
  { name: '台東区', lat: 35.7126, lng: 139.7800 },
  { name: '墨田区', lat: 35.7107, lng: 139.8015 },
  { name: '江東区', lat: 35.6731, lng: 139.8170 },
  { name: '品川区', lat: 35.6092, lng: 139.7300 },
  { name: '目黒区', lat: 35.6415, lng: 139.6982 },
  { name: '大田区', lat: 35.5614, lng: 139.7160 },
  { name: '世田谷区', lat: 35.6464, lng: 139.6532 },
  { name: '渋谷区', lat: 35.6618, lng: 139.7041 },
  { name: '中野区', lat: 35.7074, lng: 139.6638 },
  { name: '杉並区', lat: 35.6993, lng: 139.6365 },
  { name: '豊島区', lat: 35.7262, lng: 139.7167 },
  { name: '北区', lat: 35.7526, lng: 139.7335 },
  { name: '荒川区', lat: 35.7362, lng: 139.7830 },
  { name: '板橋区', lat: 35.7512, lng: 139.7090 },
  { name: '練馬区', lat: 35.7356, lng: 139.6517 },
  { name: '足立区', lat: 35.7759, lng: 139.8044 },
  { name: '葛飾区', lat: 35.7434, lng: 139.8471 },
  { name: '江戸川区', lat: 35.7069, lng: 139.8684 },
  { name: '八王子市', lat: 35.6550, lng: 139.3388 },
  { name: '立川市', lat: 35.7142, lng: 139.4071 },
  { name: '武蔵野市', lat: 35.7170, lng: 139.5661 },
  { name: '三鷹市', lat: 35.6835, lng: 139.5596 },
  { name: '府中市', lat: 35.6689, lng: 139.4776 },
  { name: '調布市', lat: 35.6506, lng: 139.5400 },
  { name: '町田市', lat: 35.5466, lng: 139.4386 },
];
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
const initialSearchEmotionFilters = {
  楽しい: true,
  喜び: true,
  '不安・心配': true,
  '怖い・恐怖': true,
  '悲しい・寂しい': true,
  安心: true,
};
const MAX_SEARCH_RESULTS = 30;
const AREA_EMOTION_LABELS = ['楽しい', '喜び', '不安・心配', '怖い・恐怖', '悲しい・寂しい'];
const EMPTY_AREA_EMOTION_COUNTS = {
  楽しい: 0,
  喜び: 0,
  '不安・心配': 0,
  '怖い・恐怖': 0,
  '悲しい・寂しい': 0,
};
const areaEmotionOptions = [
  { label: '楽しい', value: 'happy', color: '#f4c95d' },
  { label: '喜び', value: 'joy', color: '#22c55e' },
  { label: '不安・心配', value: 'worry', color: '#9f7aea' },
  { label: '怖い・恐怖', value: 'fear', color: '#fb7185' },
  { label: '悲しい・寂しい', value: 'sad', color: '#60a5fa' },
];
const ANALYSIS_PERIOD_OPTIONS = [
  { value: '7', label: '7日間' },
  { value: '30', label: '30日間' },
  { value: '90', label: '90日間' },
];
const PREFECTURE_OPTIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県',
  '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県',
  '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
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
  A区: { 楽しい: 24, 喜び: 41, '不安・心配': 12, '怖い・恐怖': 15, '悲しい・寂しい': 8 },
  B区: { 楽しい: 26, 喜び: 37, '不安・心配': 18, '怖い・恐怖': 9, '悲しい・寂しい': 10 },
  C区: { 楽しい: 39, 喜び: 31, '不安・心配': 14, '怖い・恐怖': 10, '悲しい・寂しい': 6 },
  D区: { 楽しい: 21, 喜び: 28, '不安・心配': 36, '怖い・恐怖': 6, '悲しい・寂しい': 9 },
  E区: { 楽しい: 18, 喜び: 22, '不安・心配': 42, '怖い・恐怖': 7, '悲しい・寂しい': 11 },
};

const regionAnalysisCatalog = {
  東京都: {
    level: '県',
    children: [
      { area: 'A市', share: 31, count: 852 },
      { area: 'B市', share: 26, count: 801 },
      { area: 'C市', share: 23, count: 774 },
      { area: 'D市', share: 19, count: 632 },
      { area: 'E市', share: 17, count: 501 },
    ],
  },
  A市: {
    level: '市',
    children: [
      { area: 'A区', share: 41, count: 1284 },
      { area: 'B区', share: 37, count: 1105 },
      { area: 'C区', share: 31, count: 994 },
      { area: 'D区', share: 28, count: 880 },
      { area: 'E区', share: 22, count: 517 },
    ],
  },
  B市: {
    level: '市',
    children: [
      { area: 'A区', share: 35, count: 1200 },
      { area: 'B区', share: 29, count: 1015 },
      { area: 'C区', share: 25, count: 890 },
      { area: 'D区', share: 21, count: 710 },
      { area: 'E区', share: 18, count: 600 },
    ],
  },
  A区: { level: '区', children: [
      { area: 'A地点', share: 42, count: 410 },
      { area: 'B地点', share: 35, count: 380 },
      { area: 'C地点', share: 28, count: 340 },
      { area: 'D地点', share: 23, count: 300 },
      { area: 'E地点', share: 19, count: 260 },
    ] },
  B区: { level: '区', children: [
      { area: 'A地点', share: 38, count: 390 },
      { area: 'B地点', share: 32, count: 360 },
      { area: 'C地点', share: 27, count: 320 },
      { area: 'D地点', share: 22, count: 280 },
      { area: 'E地点', share: 18, count: 240 },
    ] },
};

const normalizeEmotionToGroup = (label) => {
  if (label === 'happy') return '楽しい';
  if (label === 'joy') return '喜び';
  if (label === 'worry') return '不安・心配';
  if (label === 'fear') return '怖い・恐怖';
  if (label === 'sad') return '悲しい・寂しい';
  if (label === 'safe') return '喜び';
  if (label === 'angry') return '怖い・恐怖';
  if (label === '楽しい') return '楽しい';
  if (label === '喜び') return '喜び';
  if (label === '不安') return '不安・心配';
  if (label === '不安・心配') return '不安・心配';
  if (label === '怒り') return '怖い・恐怖';
  if (label === '怖い・恐怖') return '怖い・恐怖';
  if (label === '悲しい') return '悲しい・寂しい';
  if (label === '悲しい・寂しい') return '悲しい・寂しい';
  if (label === '安心') return '喜び';
  return label;
};

function toEmotionDisplayLabel(label) {
  if (label === 'happy') return '楽しい';
  if (label === 'joy') return '喜び';
  if (label === 'worry') return '不安・心配';
  if (label === 'fear') return '怖い・恐怖';
  if (label === 'sad') return '悲しい・寂しい';
  if (label === 'safe') return '安心';
  return label || '楽しい';
}

function toSearchEmotionCategoryLabel(label) {
  const display = toEmotionDisplayLabel(label);
  if (display === '不安') return '不安・心配';
  if (display === '悲しい') return '悲しい・寂しい';
  if (display === '怒り') return '怖い・恐怖';
  return display;
}

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

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toShortDateLabel(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildAreaEmotionTrendSeries(posts, periodDays) {
  const days = Number.isFinite(periodDays) && periodDays > 0 ? periodDays : 30;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - days + 1);

  const buckets = [];
  const bucketMap = new Map();
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = toLocalDateKey(cursor);
    const bucket = {
      key,
      dateLabel: toShortDateLabel(cursor),
      total: 0,
      ...EMPTY_AREA_EMOTION_COUNTS,
    };
    buckets.push(bucket);
    bucketMap.set(key, bucket);
    cursor.setDate(cursor.getDate() + 1);
  }

  posts.forEach((post) => {
    const createdAtTime = post?.createdAt ? Date.parse(post.createdAt) : NaN;
    if (!Number.isFinite(createdAtTime)) {
      return;
    }

    const postedDate = new Date(createdAtTime);
    if (postedDate < startDate || postedDate > endDate) {
      return;
    }

    const key = toLocalDateKey(postedDate);
    const bucket = bucketMap.get(key);
    if (!bucket) {
      return;
    }

    const emotionLabel = normalizeEmotionToGroup(post.emotion);
    if (!Object.prototype.hasOwnProperty.call(EMPTY_AREA_EMOTION_COUNTS, emotionLabel)) {
      return;
    }

    bucket[emotionLabel] += 1;
    bucket.total += 1;
  });

  return buckets.map((bucket) => {
    const denominator = bucket.total || 1;
    const next = {
      dateLabel: bucket.dateLabel,
      total: bucket.total,
    };

    AREA_EMOTION_LABELS.forEach((label) => {
      next[label] = bucket.total > 0 ? Number(((bucket[label] / denominator) * 100).toFixed(1)) : 0;
    });

    return next;
  });
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
    const clusterRadiusMeters = Math.max(...allClusterPoints.map((item) => item?.radiusMeters || 0), radiusMeters);
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
      radiusMeters: clusterRadiusMeters,
      clusterPoints: allClusterPoints,
      comments: allClusterPoints.flatMap((item) => getCircleComments(item, item.emotion || '楽しい')),
    };

    return aggregated;
  });
}

const scaleSteps = [
  { label: '5km', radius: 5000, zoom: 10.5 },
  { label: '1.5km', radius: 1500, zoom: 12.5 },
  { label: '100m', radius: 70, zoom: 15.5 },
  { label: '20m', radius: 20, zoom: 17.5 },
];

function getRadiusForScaleIndex(index) {
  const safeIndex = clampIndex(index);
  return scaleSteps[safeIndex].radius;
}

function getDisplayRadiusMeters(point, scaleIndex, fallbackRadiusMeters) {
  if (scaleIndex === 1 && point?.sourceType === 'map-label') {
    return point?.radiusMeters || fallbackRadiusMeters;
  }

  return fallbackRadiusMeters;
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

function parseAdministrativeNames(value = '') {
  const text = `${value || ''}`.trim();
  if (!text) {
    return { prefecture: null, city: null, ward: null };
  }

  const prefecture = PREFECTURE_OPTIONS.find((name) => text.includes(name)) || null;
  const wardMatch = text.match(/([^\s,，]+?区)/);
  const cityMatch = text.match(/([^\s,，]+?市)/);

  return {
    prefecture,
    city: cityMatch?.[1] || null,
    ward: wardMatch?.[1] || null,
  };
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
  const mapCanvasRef = useRef(null);
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
  const [selectedAreaEmotion, setSelectedAreaEmotion] = useState('不安・心配');
  const [selectedPrefecture, setSelectedPrefecture] = useState('東京都');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [analysisLevel, setAnalysisLevel] = useState('区');
  const [mypostSort, setMypostSort] = useState('新しい順');
  const [regionEmotionStats, setRegionEmotionStats] = useState(districtEmotionMap);
  const [textareaText, setTextareaText] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [postPlaceName, setPostPlaceName] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isMapPlaceSelectionMode, setIsMapPlaceSelectionMode] = useState(false);
  const [hidePlaceInputForSelection, setHidePlaceInputForSelection] = useState(false);
  const [representativePoints, setRepresentativePoints] = useState([]);
  const [postedEmotionPoints, setPostedEmotionPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const [mapLoadError, setMapLoadError] = useState('');
  const [searchFilterKeyword, setSearchFilterKeyword] = useState('');
  const [searchEmotionFilters, setSearchEmotionFilters] = useState(initialSearchEmotionFilters);
  const [searchResultSort, setSearchResultSort] = useState('newest');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResultMessage, setSearchResultMessage] = useState('');
  const [searchResultMessageType, setSearchResultMessageType] = useState('');
  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');
  const [dynamicAreaRankingRows, setDynamicAreaRankingRows] = useState([]);
  const [isAreaRankingLoading, setIsAreaRankingLoading] = useState(false);
  const [areaEmotionCounts, setAreaEmotionCounts] = useState(EMPTY_AREA_EMOTION_COUNTS);
  const [areaEmotionPercents, setAreaEmotionPercents] = useState(EMPTY_AREA_EMOTION_COUNTS);
  const [areaTotalVotes, setAreaTotalVotes] = useState(0);
  const [analysisPeriodDays, setAnalysisPeriodDays] = useState('30');
  const [areaAnalysisPosts, setAreaAnalysisPosts] = useState([]);
  const [municipalityCenters, setMunicipalityCenters] = useState([]);
  const mapPlaceSelectionModeRef = useRef(false);
  const generatedDummyIdsRef = useRef([]);
  const lastDynamicRepresentativeKeyRef = useRef('');

  const updateDynamicRepresentativePoints = (map) => {
    if (!map || !window.mapboxgl || !map.isStyleLoaded || !map.isStyleLoaded()) {
      return;
    }

    const placeClassAllowList = new Set([
      'country',
      'state',
      'province',
      'region',
      'district',
      'settlement',
      'settlement_subdivision',
      'city',
      'town',
      'village',
      'hamlet',
      'locality',
      'suburb',
      'neighbourhood',
      'quarter',
    ]);

    const styleLayers = map.getStyle()?.layers || [];
    const candidateLayerIds = styleLayers
      .filter((layer) => {
        if (layer.type !== 'symbol') return false;
        const layerId = layer.id.toLowerCase();
        if (layerId.includes('poi') || layerId.includes('transit') || layerId.includes('road')) {
          return false;
        }
        return (
          layerId.includes('place') ||
          layerId.includes('settlement') ||
          layerId.includes('state') ||
          layerId.includes('country') ||
          layerId.includes('admin')
        );
      })
      .map((layer) => layer.id)
      .filter((layerId) => layerId.toLowerCase().includes('label'));

    if (!candidateLayerIds.length) {
      return;
    }

    try {
      const features = map.queryRenderedFeatures({ layers: candidateLayerIds });
      const dynamicPoints = features
        .map((feature) => {
          const featureClass = `${feature.properties?.class || feature.properties?.type || ''}`.toLowerCase();
          const layerId = `${feature.layer?.id || ''}`.toLowerCase();

          if (featureClass && !placeClassAllowList.has(featureClass)) {
            return null;
          }

          const label = feature.properties?.name || feature.properties?.['name_en'] || '';
          const coordinates = feature.geometry?.coordinates;
          if (!label || !Array.isArray(coordinates)) {
            return null;
          }

          const isSubdivisionLayer =
            layerId.includes('subdivision') ||
            layerId.includes('neighbourhood') ||
            layerId.includes('locality') ||
            layerId.includes('place-town') ||
            layerId.includes('place-village');

          const isMajorLayer =
            layerId.includes('settlement-major') ||
            layerId.includes('place-city') ||
            layerId.includes('admin') ||
            layerId.includes('state') ||
            layerId.includes('country');

          const isMajorAreaLabel =
            !isSubdivisionLayer &&
            (isMajorLayer ||
              ['country', 'state', 'province', 'region', 'district', 'city'].includes(featureClass) ||
              /(都|道|府|県|市|区)$/.test(label));

          const lng = Array.isArray(coordinates[0]) ? coordinates[0][0] : coordinates[0];
          const lat = Array.isArray(coordinates[0]) ? coordinates[0][1] : coordinates[1];

          if (typeof lng !== 'number' || typeof lat !== 'number' || Number.isNaN(lng) || Number.isNaN(lat)) {
            return null;
          }

          return {
            id: `${label}-${feature.layer?.id || 'dynamic'}`,
            name: label,
            emotion: '楽しい',
            color: '#facc15',
            coords: [lng, lat],
            radiusMeters: isMajorAreaLabel ? 2000 : 1000,
            sourceType: 'map-label',
            comments: getCircleComments({ emotion: '楽しい' }, '楽しい'),
          };
        })
        .filter(Boolean)
        .slice(0, 120);

      if (dynamicPoints.length === 0) {
        return;
      }

      const nextKey = JSON.stringify(dynamicPoints.map((point) => `${point.name}:${point.coords.join(',')}`));

      if (nextKey === lastDynamicRepresentativeKeyRef.current) {
        return;
      }

      lastDynamicRepresentativeKeyRef.current = nextKey;
      setRepresentativePoints(dynamicPoints);
    } catch (error) {
      console.warn('Dynamic region label extraction failed:', error);
    }
  };

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

  useEffect(() => {
    let isCancelled = false;

    const loadMunicipalityCenters = async () => {
      try {
        const response = await fetch('/data/municipality-centers.json');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!isCancelled) {
          setMunicipalityCenters(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setMunicipalityCenters([]);
        }
      }
    };

    loadMunicipalityCenters();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadPostedEmotionPointsFromApi() {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (isCancelled) {
          return;
        }

        const posts = Array.isArray(data?.posts) ? data.posts : [];
        const points = posts
          .map((post) => {
            const lng = Number(post.lng);
            const lat = Number(post.lat);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
              return null;
            }

            const emotionLabel = toEmotionDisplayLabel(post.emotion);
            const timestamp = post.createdAt
              ? new Date(post.createdAt).toLocaleString('ja-JP', {
                  timeZone: 'Asia/Tokyo',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '最近';

            return {
              id: String(post.id),
              name: post.locationName || '投稿地点',
              emotion: emotionLabel,
              color: resolveEmotionColor(normalizeEmotionToGroup(emotionLabel)),
              coords: [lng, lat],
              radiusMeters: getRadiusForScaleIndex(scaleIndexRef.current),
              size: 42,
              comments: [
                {
                  emotion: emotionLabel,
                  time: timestamp,
                  text: post.comment || '投稿コメント',
                },
              ],
            };
          })
          .filter(Boolean);

        setPostedEmotionPoints(points);
      } catch (error) {
        console.warn('Failed to load posts from API:', error);
      }
    }

    loadPostedEmotionPointsFromApi();

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
      if (!map.isStyleLoaded || !map.isStyleLoaded()) {
        return;
      }

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
      const hideBaselineAtCloseScale = scaleIndexRef.current >= 2;
      const allVisiblePoints = hideBaselineAtCloseScale
        ? [...postedEmotionPoints]
        : [...representativePoints, ...postedEmotionPoints];
      const visiblePoints = isFiveKmScale ? representativePoints : allVisiblePoints;

      if (visiblePoints.length === 0) {
        return;
      }

      const shouldClusterAtOneKm = scaleIndexRef.current === 1;
      const shouldClusterAtCloseZoom = scaleIndexRef.current >= 2;
      const shouldRenderBaselineCircles = true;
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
          const pointRadiusMeters = getDisplayRadiusMeters(point, scaleIndexRef.current, targetRadiusMeters);
          const sourcePoints = isFiveKmScale
            ? allVisiblePoints
            : (shouldClusterAtOneKm || shouldClusterAtCloseZoom) && point.clusterPoints && point.clusterPoints.length > 1
              ? point.clusterPoints
              : [point];
          const dominantColor = getDominantEmotionColor(point, sourcePoints, pointRadiusMeters);

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: point.coords,
            },
            properties: {
              color: dominantColor,
              radius: metersToPixelsAtZoom(pointRadiusMeters, centerLat, currentZoom),
              name: point.name,
              emotion: point.emotion,
              pinIcon: emotionPinAssetMap[point.emotion] ?? emotionPinAssetMap.default,
            },
          };
        }),
      };

      if (shouldRenderBaselineCircles) {
        map.addSource('posted-emotion-source', {
          type: 'geojson',
          data: circleGeoJson,
        });

        const firstLabelLayerId = (map.getStyle()?.layers || []).find(
          (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
        )?.id;

        const emotionCircleLayer = {
          id: 'posted-emotion-layer',
          type: 'circle',
          source: 'posted-emotion-source',
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': ['get', 'color'],
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.22, 11, 0.3, 14, 0.38],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.72,
            'circle-stroke-width': 1.2,
          },
        };

        if (firstLabelLayerId) {
          map.addLayer(emotionCircleLayer, firstLabelLayerId);
        } else {
          map.addLayer(emotionCircleLayer);
        }
      }

      const markerPoints = isFiveKmScale ? fiveKmDisplayPoints : (shouldClusterAtOneKm || shouldClusterAtCloseZoom ? aggregatedVisiblePoints : visiblePoints);
      const markerEls = markerPoints.map((point) => {
        const pin = document.createElement('div');
        pin.className = 'emotion-pin-marker';
        pin.style.cursor = 'pointer';
        const shouldCenterPinAtCloseScale = scaleIndexRef.current >= 2;

        const clusterPoints = point.clusterPoints || [point];
        const markerRadiusMeters = getDisplayRadiusMeters(point, scaleIndexRef.current, targetRadiusMeters);
        const clusterEmotionGroups = [...new Set(clusterPoints.map((item) => normalizeEmotionToGroup(item.emotion || '楽しい')))].filter(Boolean);
        const isMixedCluster = clusterPoints.length > 1 && clusterEmotionGroups.length > 1;
        const markerEmotion = isMixedCluster ? 'other_plusN' : getDominantEmotionLabel(point, clusterPoints, markerRadiusMeters);
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
          anchor: shouldCenterPinAtCloseScale ? 'center' : 'bottom',
          offset: shouldCenterPinAtCloseScale ? [0, 0] : [0, markerEmotion === 'other_plusN' ? -14 : -10],
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
      if (map.isStyleLoaded && map.isStyleLoaded()) {
        if (map.getLayer('posted-emotion-layer')) {
          map.removeLayer('posted-emotion-layer');
        }
        if (map.getSource('posted-emotion-source')) {
          map.removeSource('posted-emotion-source');
        }
      }
    };
  }, [postedEmotionPoints, representativePoints]);

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      try {
        setMapLoadError('');
        loadStylesheet('https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css');
        await loadScript('https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-language@1.0.0/index.js');

        console.log('Mapbox diagnostic:', {
          isMounted,
          hasMapContainer: !!mapCanvasRef.current,
          hasMapboxgl: !!window.mapboxgl,
          hasToken: !!MAPBOX_TOKEN,
          tokenLength: MAPBOX_TOKEN?.length ?? 0,
        });

        if (!isMounted) {
          return;
        }

        if (mapRef.current) {
          return;
        }

        if (!mapCanvasRef.current || !window.mapboxgl) {
          throw new Error('Mapbox GL を読み込めませんでした。ネットワークまたはトークン設定を確認してください。');
        }

        if (!MAPBOX_TOKEN) {
          throw new Error('Mapbox access token が未設定です。frontend/.env に VITE_MAPBOX_TOKEN を設定してください。');
        }

        window.mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new window.mapboxgl.Map({
          container: mapCanvasRef.current,
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

        requestAnimationFrame(() => {
          map.resize();
        });

        map.on('load', () => {
          map.resize();
          updateDynamicRepresentativePoints(map);
        });

        map.on('style.load', () => {
          updateDynamicRepresentativePoints(map);
        });

        map.on('idle', () => {
          if (map.isStyleLoaded && map.isStyleLoaded()) {
            updateDynamicRepresentativePoints(map);
          }
        });

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
        console.error('Mapbox error details:', error?.message, error?.stack);
        if (isMounted) {
          setMapLoadError(error?.message || '地図の初期化に失敗しました。');
        }
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
    if (isSubmittingPost) {
      return;
    }

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

    setIsSubmittingPost(true);

    let savedPost = null;
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'tester',
          emotion: selectedEmotion,
          lat: coordinates[1],
          lng: coordinates[0],
          comment: commentText,
          locationName: placeNameForCard,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.status !== 'ok') {
        throw new Error(payload?.message || '投稿の保存に失敗しました');
      }

      savedPost = payload.post || null;
    } catch (error) {
      setStatus(error?.message || '投稿の保存に失敗しました');
      setStatusType('error');
      setIsSubmittingPost(false);
      return;
    }

    const savedCoords =
      savedPost && typeof savedPost.lng === 'number' && typeof savedPost.lat === 'number'
        ? [savedPost.lng, savedPost.lat]
        : coordinates;

    const savedTimestamp = savedPost?.createdAt
      ? new Date(savedPost.createdAt).toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : timestamp;

    setSelectedPlace((current) => {
      const base = current || nextPlaceData;
      const updatedEmotions = base.emotions.map((item) =>
        item.label === selectedEmotionData.label
          ? { ...item, value: item.value + 1 }
          : item
      );

      return {
        ...base,
        coords: savedCoords,
        name: placeNameForCard,
        emotions: updatedEmotions,
        comments: [{ emotion: selectedEmotionData.label, time: savedTimestamp, text: commentText }, ...base.comments].slice(0, 8),
      };
    });

    setPostedEmotionPoints((current) => [
      ...current,
      {
        id: String(savedPost?.id ?? `${Date.now()}-${selectedEmotionData.label}`),
        name: placeNameForCard,
        emotion: selectedEmotionData.label,
        color: selectedEmotionData.color,
        coords: savedCoords,
        radiusMeters: getRadiusForScaleIndex(scaleIndexRef.current),
        size: 42 + (selectedEmotionData.label === '不安・心配' ? 10 : 0),
        comments: [
          { emotion: selectedEmotionData.label, time: savedTimestamp, text: commentText },
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
      const base = { ...((current[regionKey] ?? districtEmotionMap[regionKey]) ?? { 楽しい: 0, 喜び: 0, '不安・心配': 0, '怖い・恐怖': 0, '悲しい・寂しい': 0 }) };
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
    setIsSubmittingPost(false);
  };

  const normalizedRegionKey = (selectedRegion || '東京都').trim();

  const resolvedAnalysisLocation = (() => {
    const exact = regionAnalysisCatalog[normalizedRegionKey];
    if (exact) {
      return {
        exists: true,
        name: normalizedRegionKey,
        level: exact.level,
        items: exact.children,
        statsKey: exact.children?.[0]?.area || 'A区',
      };
    }

    const matchedKey = Object.keys(regionAnalysisCatalog).find((key) => {
      const normalizedKey = key.replace(/[県市区]/g, '').trim();
      const normalizedInput = normalizedRegionKey.replace(/[県市区]/g, '').trim();
      return normalizedKey === normalizedInput || normalizedKey.includes(normalizedInput) || normalizedInput.includes(normalizedKey);
    });

    if (matchedKey) {
      const target = regionAnalysisCatalog[matchedKey];
      return {
        exists: true,
        name: matchedKey,
        level: target.level,
        items: target.children,
        statsKey: target.children?.[0]?.area || 'A区',
      };
    }

    return {
      exists: false,
      name: '地名が存在しません',
      level: analysisLevel,
      items: [],
      statsKey: 'A区',
    };
  })();

  const regionKeyCandidates = Object.keys(districtEmotionMap);
  const matchedRegionKey =
    regionKeyCandidates.find((key) => key.toLowerCase() === normalizedRegionKey.toLowerCase()) ||
    regionKeyCandidates.find((key) => key.toLowerCase().includes(normalizedRegionKey.toLowerCase())) ||
    'A区';

  const currentRegionEmotionStats = areaEmotionPercents;

  const analysisRankingRows = isAreaRankingLoading
    ? [{ area: '集計中...', share: 0, count: 0 }]
    : dynamicAreaRankingRows.length > 0
      ? dynamicAreaRankingRows
      : [{ area: '該当データなし', share: 0, count: 0 }];

  const areaEmotionTrendSeries = buildAreaEmotionTrendSeries(areaAnalysisPosts, Number(analysisPeriodDays));
  const trendChartWidth = 920;
  const trendChartHeight = 280;
  const trendChartPadding = { top: 22, right: 18, bottom: 30, left: 42 };
  const trendPlotWidth = trendChartWidth - trendChartPadding.left - trendChartPadding.right;
  const trendPlotHeight = trendChartHeight - trendChartPadding.top - trendChartPadding.bottom;
  const trendPointCount = areaEmotionTrendSeries.length;
  const trendXStep = trendPointCount > 1 ? trendPlotWidth / (trendPointCount - 1) : 0;
  const trendTickInterval = Math.max(1, Math.floor(trendPointCount / 6));
  const trendGridPercents = [0, 25, 50, 75, 100];
  const periodVotesTotal = areaEmotionTrendSeries.reduce((sum, row) => sum + row.total, 0);

  const toTrendX = (index) => trendChartPadding.left + trendXStep * index;
  const toTrendY = (value) => trendChartPadding.top + ((100 - value) / 100) * trendPlotHeight;

  const trendEmotionLines = AREA_EMOTION_LABELS.map((label) => {
    const color = areaEmotionOptions.find((item) => item.label === label)?.color || '#94a3b8';
    const points = areaEmotionTrendSeries
      .map((row, index) => `${toTrendX(index)},${toTrendY(row[label] || 0)}`)
      .join(' ');

    return {
      label,
      color,
      points,
      markers: areaEmotionTrendSeries.map((row, index) => ({
        x: toTrendX(index),
        y: toTrendY(row[label] || 0),
      })),
    };
  });

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

  const formatSearchDate = (isoDate) => {
    if (!isoDate) {
      return '日時不明';
    }

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return '日時不明';
    }

    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const applySearchFilterAndSort = (posts, emotionsFilter, sortType) => {
    const selectedEmotionLabels = Object.entries(emotionsFilter)
      .filter(([, checked]) => checked)
      .map(([label]) => label);

    if (selectedEmotionLabels.length === 0) {
      return [];
    }

    const selectedSet = new Set(selectedEmotionLabels);
    const filtered = posts.filter((item) => selectedSet.has(item.emotionCategory));

    const sorted = filtered.sort((a, b) => {
      if (sortType === 'oldest') {
        return a.createdAtTime - b.createdAtTime;
      }

      if (sortType === 'emotion') {
        return a.emotion.localeCompare(b.emotion, 'ja');
      }

      return b.createdAtTime - a.createdAtTime;
    });

    return sorted.slice(0, MAX_SEARCH_RESULTS);
  };

  const resolveSearchBoundingBox = async (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed || !MAPBOX_TOKEN) {
      return null;
    }

    const normalized = normalizeGeocodeText(trimmed);
    if (normalized === '東京' || normalized === '東京都' || normalized === 'tokyo') {
      return {
        minLng: 138.90,
        minLat: 35.20,
        maxLng: 140.05,
        maxLat: 36.05,
      };
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?country=jp&language=ja&limit=5&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const feature = pickBestGeocodeCandidate(trimmed, data.features || []);
      if (!feature) {
        return null;
      }

      if (Array.isArray(feature.bbox) && feature.bbox.length === 4) {
        return {
          minLng: Number(feature.bbox[0]),
          minLat: Number(feature.bbox[1]),
          maxLng: Number(feature.bbox[2]),
          maxLat: Number(feature.bbox[3]),
        };
      }

      const center = feature.center || feature.geometry?.coordinates;
      if (!Array.isArray(center) || center.length < 2) {
        return null;
      }

      const lng = Number(center[0]);
      const lat = Number(center[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return null;
      }

      const normalized = normalizeGeocodeText(trimmed);
      let radiusKm = 2;
      if (/都|道|府|県|tokyo/.test(normalized)) {
        radiusKm = 55;
      } else if (/市|区|町|村|city|ward/.test(normalized)) {
        radiusKm = 8;
      }

      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.2));
      return {
        minLng: lng - lngDelta,
        minLat: lat - latDelta,
        maxLng: lng + lngDelta,
        maxLat: lat + latDelta,
      };
    } catch (error) {
      return null;
    }
  };

  const resolveAreaRankingLabel = (post) => {
    const rawName = (post.locationName || '').trim();
    const isMapPlaceLabel = rawName.startsWith('地図上の場所');
    if (rawName && !isMapPlaceLabel) {
      return rawName;
    }

    const lng = Number(post.lng);
    const lat = Number(post.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || municipalityCenters.length === 0) {
      return rawName || '地点不明';
    }

    const nearest = municipalityCenters.reduce((best, item) => {
      const centerLng = Number(item.lng);
      const centerLat = Number(item.lat);
      if (!Number.isFinite(centerLng) || !Number.isFinite(centerLat)) {
        return best;
      }

      const distance = haversineDistanceMeters([lng, lat], [centerLng, centerLat]);
      if (!best || distance < best.distance) {
        return { name: item.name, distance };
      }

      return best;
    }, null);

    return nearest?.name || rawName || '地点不明';
  };

  const resolveTokyoMunicipalityByCoords = (lng, lat) => {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return null;
    }

    const nearest = TOKYO_MUNICIPALITY_CENTERS.reduce((best, center) => {
      const distance = haversineDistanceMeters([lng, lat], [center.lng, center.lat]);
      if (!best || distance < best.distance) {
        return { name: center.name, distance };
      }
      return best;
    }, null);

    return nearest?.name || null;
  };

  const resolveAreaHierarchyForPost = (post) => {
    const rawName = (post.locationName || '').trim();
    const fallbackByCoord = resolveTokyoMunicipalityByCoords(Number(post.lng), Number(post.lat));
    const fallbackLabel = fallbackByCoord || resolveAreaRankingLabel(post);

    const fromRaw = parseAdministrativeNames(rawName);
    const fromFallback = parseAdministrativeNames(fallbackLabel);

    const city = fromRaw.city || fromFallback.city || (fallbackLabel.endsWith('市') ? fallbackLabel : null);
    const ward = fromRaw.ward || fromFallback.ward || (fallbackLabel.endsWith('区') ? fallbackLabel : null);
    const place = rawName && !rawName.startsWith('地図上の場所') ? rawName : fallbackLabel || '地点不明';

    return {
      prefecture: fromRaw.prefecture || fromFallback.prefecture,
      city,
      ward,
      place,
      cityOrWard: ward || city || fallbackLabel || '地点不明',
    };
  };

  const resolveAreaNameByAnalysisLevel = (post, level) => {
    const hierarchy = resolveAreaHierarchyForPost(post);
    if (level === '市') {
      return hierarchy.city;
    }
    if (level === '区') {
      return hierarchy.ward;
    }
    return hierarchy.cityOrWard;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadAreaRanking = async () => {
      if (activeTab !== 'area') {
        return;
      }

      const targetPrefecture = (selectedPrefecture || '').trim();
      if (!targetPrefecture) {
        setDynamicAreaRankingRows([]);
        setAreaTotalVotes(0);
        setAreaEmotionCounts(EMPTY_AREA_EMOTION_COUNTS);
        setAreaEmotionPercents(EMPTY_AREA_EMOTION_COUNTS);
        setAreaAnalysisPosts([]);
        return;
      }

      setIsAreaRankingLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('keyword', targetPrefecture);

        const bbox = await resolveSearchBoundingBox(targetPrefecture);
        if (bbox) {
          params.set('minLng', String(bbox.minLng));
          params.set('minLat', String(bbox.minLat));
          params.set('maxLng', String(bbox.maxLng));
          params.set('maxLat', String(bbox.maxLat));
        }

        const response = await fetch(`/api/posts/search?${params.toString()}`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status !== 'ok') {
          throw new Error(payload?.message || 'エリア別ランキングの取得に失敗しました');
        }

        const posts = Array.isArray(payload.posts) ? payload.posts : [];

        const nextCounts = { ...EMPTY_AREA_EMOTION_COUNTS };
        posts.forEach((post) => {
          const label = normalizeEmotionToGroup(post.emotion);
          if (Object.prototype.hasOwnProperty.call(nextCounts, label)) {
            nextCounts[label] += 1;
          }
        });

        const totalVotes = posts.length;
        const denominator = totalVotes || 1;
        const nextPercents = AREA_EMOTION_LABELS.reduce((acc, label) => {
          acc[label] = Number(((nextCounts[label] / denominator) * 100).toFixed(1));
          return acc;
        }, { ...EMPTY_AREA_EMOTION_COUNTS });

        const filteredByEmotion = posts.filter((post) => normalizeEmotionToGroup(post.emotion) === selectedAreaEmotion);

        let areaNames = filteredByEmotion
          .map((post) => resolveAreaNameByAnalysisLevel(post, analysisLevel))
          .filter((name) => name && name !== '東京' && name !== '東京都');

        if (analysisLevel === '市') {
          areaNames = areaNames.filter((name) => name.endsWith('市'));
        }
        if (analysisLevel === '区') {
          areaNames = areaNames.filter((name) => name.endsWith('区'));
        }

        const countsByArea = new Map();
        areaNames.forEach((areaName) => {
          countsByArea.set(areaName, (countsByArea.get(areaName) || 0) + 1);
        });

        const total = areaNames.length || 1;
        const nextRows = [...countsByArea.entries()]
          .map(([area, count]) => ({
            area,
            count,
            share: Number(((count / total) * 100).toFixed(1)),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        if (!isCancelled) {
          setDynamicAreaRankingRows(nextRows);
          setAreaTotalVotes(totalVotes);
          setAreaEmotionCounts(nextCounts);
          setAreaEmotionPercents(nextPercents);
          setAreaAnalysisPosts(posts);
        }
      } catch (error) {
        if (!isCancelled) {
          setDynamicAreaRankingRows([]);
          setAreaTotalVotes(0);
          setAreaEmotionCounts(EMPTY_AREA_EMOTION_COUNTS);
          setAreaEmotionPercents(EMPTY_AREA_EMOTION_COUNTS);
          setAreaAnalysisPosts([]);
        }
      } finally {
        if (!isCancelled) {
          setIsAreaRankingLoading(false);
        }
      }
    };

    loadAreaRanking();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, selectedPrefecture, selectedAreaEmotion, municipalityCenters, analysisLevel]);

  const executePostSearch = async ({
    nextKeyword = searchFilterKeyword,
    nextEmotionFilters = searchEmotionFilters,
    nextSort = searchResultSort,
    nextFromDate = searchFromDate,
    nextToDate = searchToDate,
  } = {}) => {
    setIsSearchLoading(true);
    setSearchResultMessage('検索中です...');
    setSearchResultMessageType('');

    try {
      if (nextFromDate && nextToDate && nextFromDate > nextToDate) {
        setSearchResults([]);
        setSearchResultMessage('投稿期間の開始日は終了日以前にしてください');
        setSearchResultMessageType('error');
        return;
      }

      const trimmedKeyword = nextKeyword.trim();
      const params = new URLSearchParams();
      if (trimmedKeyword) {
        params.set('keyword', trimmedKeyword);

        const bbox = await resolveSearchBoundingBox(trimmedKeyword);
        if (bbox) {
          params.set('minLng', String(bbox.minLng));
          params.set('minLat', String(bbox.minLat));
          params.set('maxLng', String(bbox.maxLng));
          params.set('maxLat', String(bbox.maxLat));
        }
      }

      if (nextFromDate) {
        params.set('fromDate', nextFromDate);
      }

      if (nextToDate) {
        params.set('toDate', nextToDate);
      }

      const query = params.toString();
      const endpoint = query ? `/api/posts/search?${query}` : '/api/posts/search';
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.status !== 'ok') {
        throw new Error(payload?.message || '投稿検索に失敗しました');
      }

      const mappedResults = (Array.isArray(payload.posts) ? payload.posts : [])
        .map((post) => {
          const lng = Number(post.lng);
          const lat = Number(post.lat);
          const emotion = toEmotionDisplayLabel(post.emotion);
          const emotionCategory = toSearchEmotionCategoryLabel(post.emotion);
          const createdAtTime = post.createdAt ? Date.parse(post.createdAt) : 0;

          return {
            id: post.id,
            emotion,
            emotionCategory,
            locationName: post.locationName || '投稿地点',
            comment: post.comment || '',
            dateLabel: formatSearchDate(post.createdAt),
            createdAtTime: Number.isFinite(createdAtTime) ? createdAtTime : 0,
            color: resolveEmotionColor(normalizeEmotionToGroup(emotion)),
            lat,
            lng,
          };
        })
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

      const filteredAndSorted = applySearchFilterAndSort(mappedResults, nextEmotionFilters, nextSort);
      setSearchResults(filteredAndSorted);
      if (Object.values(nextEmotionFilters).every((checked) => !checked)) {
        setSearchResultMessage('感情カテゴリを1つ以上選択してください');
        setSearchResultMessageType('error');
        return;
      }

      setSearchResultMessage(filteredAndSorted.length === 0 ? '条件に一致する投稿はありません' : `${filteredAndSorted.length}件を厳選して表示しています`);
      setSearchResultMessageType(filteredAndSorted.length === 0 ? '' : 'success');
    } catch (error) {
      setSearchResults([]);
      setSearchResultMessage(error?.message || '投稿検索に失敗しました');
      setSearchResultMessageType('error');
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleSearchEmotionFilterChange = (label, checked) => {
    setSearchEmotionFilters((current) => ({
      ...current,
      [label]: checked,
    }));
  };

  const handleApplySearchFilters = async () => {
    await executePostSearch({
      nextKeyword: searchFilterKeyword,
      nextEmotionFilters: searchEmotionFilters,
      nextSort: searchResultSort,
      nextFromDate: searchFromDate,
      nextToDate: searchToDate,
    });
  };

  const handleSearchSortChange = async (nextSort) => {
    setSearchResultSort(nextSort);
    await executePostSearch({
      nextKeyword: searchFilterKeyword,
      nextEmotionFilters: searchEmotionFilters,
      nextSort,
      nextFromDate: searchFromDate,
      nextToDate: searchToDate,
    });
  };

  const jumpToMapFromSearchResult = (item) => {
    if (!Number.isFinite(item?.lat) || !Number.isFinite(item?.lng)) {
      return;
    }

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [item.lng, item.lat],
        zoom: Math.max(mapRef.current.getZoom(), scaleSteps[2].zoom),
        duration: 700,
        essential: true,
      });
    }

    setSelectedPlace(buildPlaceData(item.locationName, [item.lng, item.lat]));
    setStatus(`${item.locationName} を表示しました`);
    setStatusType('success');
    setActiveTab('map');
  };

  if (mapLoadError) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ width: 'min(640px, calc(100% - 32px))', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', padding: '28px 24px', color: '#0f172a' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '2rem' }}>EmotionStrataMap</h2>
          <p style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#334155' }}>地図を読み込めませんでした</p>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {mapLoadError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="map-container">
      <div ref={mapCanvasRef} className="map-canvas" />

      <header className="topbar">
        <div className="topbar-left">
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
              <div className="filter-count-box">{Object.values(searchEmotionFilters).filter(Boolean).length}</div>
            </div>

            <div className="filter-group">
              <label className="filter-label">場所・キーワードで検索</label>
              <input
                type="text"
                placeholder="場所・キーワードで検索"
                className="filter-input"
                value={searchFilterKeyword}
                onChange={(event) => setSearchFilterKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleApplySearchFilters();
                  }
                }}
              />
              <div className="filter-hint">例: 東京, 駅前, 公園</div>
            </div>

            <div className="filter-group">
              <label className="filter-label">感情カテゴリ</label>
              <div className="emotion-checklist">
                {Object.keys(initialSearchEmotionFilters).map((label) => (
                  <label key={label}>
                    <input
                      type="checkbox"
                      checked={Boolean(searchEmotionFilters[label])}
                      onChange={(event) => handleSearchEmotionFilterChange(label, event.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">投稿期間</label>
              <div className="date-row">
                <input
                  type="date"
                  value={searchFromDate}
                  onChange={(event) => setSearchFromDate(event.target.value)}
                  className="date-input"
                />
                <span>~</span>
                <input
                  type="date"
                  value={searchToDate}
                  onChange={(event) => setSearchToDate(event.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">並び順</label>
              <div className="tag-row">
                <button
                  type="button"
                  className={`filter-tag ${searchResultSort === 'newest' ? 'active' : ''}`}
                  onClick={() => handleSearchSortChange('newest')}
                >
                  新しい順
                </button>
                <button
                  type="button"
                  className={`filter-tag ${searchResultSort === 'oldest' ? 'active' : ''}`}
                  onClick={() => handleSearchSortChange('oldest')}
                >
                  古い順
                </button>
                <button
                  type="button"
                  className={`filter-tag ${searchResultSort === 'emotion' ? 'active' : ''}`}
                  onClick={() => handleSearchSortChange('emotion')}
                >
                  感情順
                </button>
              </div>
            </div>

            <div className="filter-group">
              <button type="button" className="apply-button" onClick={handleApplySearchFilters} disabled={isSearchLoading}>
                {isSearchLoading ? '検索中...' : 'この条件で検索'}
              </button>
            </div>

            {searchResultMessage && (
              <div className={`search-status ${searchResultMessageType}`}>
                {searchResultMessage}
              </div>
            )}
          </aside>

          <main className="search-result-panel">
            <div className="result-header">
              <div className="result-title">検索結果</div>
              <div className="result-count-box">{searchResults.length}件</div>
              <button type="button" className="list-toggle">リスト</button>
            </div>

            <div className="result-list">
              {searchResults.map((item, index) => (
                <div key={item.id} className="result-item">
                  <div className="result-rank">{index + 1}</div>
                  <div className="result-emotion-mark" style={{ background: item.color }} />
                  <div className="result-main">
                    <div className="result-title-row">
                      <strong>{item.locationName}</strong>
                      <span className="result-date">{item.dateLabel}</span>
                    </div>
                    <p>{item.comment || 'コメントなし'}</p>
                  </div>
                  <button type="button" className="map-link" onClick={() => jumpToMapFromSearchResult(item)}>地図で見る →</button>
                </div>
              ))}

              {!isSearchLoading && searchResults.length === 0 && (
                <div className="result-item result-item-empty">
                  <div className="result-main">
                    <div className="result-title-row">
                      <strong>検索結果はありません</strong>
                    </div>
                    <p>「東京」などの場所・キーワードで検索してください。</p>
                  </div>
                </div>
              )}
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
                value={analysisLevel}
                onChange={(event) => setAnalysisLevel(event.target.value)}
                className="analysis-select"
              >
                <option value="市">市</option>
                <option value="区">区</option>
              </select>

              <select
                value={selectedPrefecture}
                onChange={(event) => setSelectedPrefecture(event.target.value)}
                className="analysis-select"
              >
                {PREFECTURE_OPTIONS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

            </div>
          </div>

          <div className="analysis-content">
            <aside className="analysis-ranking-panel">
              <div className="analysis-panel-header">
                <div className="panel-label">{selectedPrefecture ? `${selectedPrefecture}の${analysisLevel}別` : ''}{selectedAreaEmotion}ランキング</div>
                <div className="panel-count">{analysisRankingRows.length}</div>
              </div>

              <div className="area-ranking-list">
                {analysisRankingRows.map((item, index) => (
                  <div key={`${selectedAreaEmotion}-${item.area}`} className="area-ranking-row">
                    <div className="area-rank-badge">{index + 1}</div>
                    <div className="area-rank-line">
                      <div className="area-rank-meta">
                        <span className="area-name">{item.area}</span>
                        <span className="area-count">{item.count ? `${item.count.toLocaleString()}件` : 'なし'}</span>
                      </div>
                      <div className="area-progress-track">
                        <span
                          className="area-progress-fill"
                          style={{ width: `${Math.max(item.share ?? 0, 0)}%`, background: areaEmotionOptions.find((emotion) => emotion.label === selectedAreaEmotion)?.color || '#1dc9a8' }}
                        />
                      </div>
                    </div>
                    <div className="area-percent">{item.share ?? 0}%</div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="analysis-trend-panel">
              <div className="analysis-panel-header">
                <div className="panel-label">{selectedPrefecture ? `${selectedPrefecture}の感情傾向` : '都道府県を選択してください'}</div>
                <div className="analysis-trend-header-controls">
                  <select
                    value={analysisPeriodDays}
                    onChange={(event) => setAnalysisPeriodDays(event.target.value)}
                    className="analysis-period-select"
                    aria-label="分析期間"
                  >
                    {ANALYSIS_PERIOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="panel-count">{currentRegionEmotionStats?.[selectedAreaEmotion] ?? 0}%</div>
                </div>
              </div>

              <div className="trend-layout">
                <div className="trend-visualization">
                  <div className="line-chart-shell">
                    <div className="line-chart-caption">日別の感情割合推移（%）</div>
                    <div className="line-chart-legend">
                      {AREA_EMOTION_LABELS.map((label) => {
                        const color = areaEmotionOptions.find((item) => item.label === label)?.color || '#94a3b8';
                        return (
                          <div key={`${selectedPrefecture}-${analysisLevel}-legend-${label}`} className="line-legend-item">
                            <span className="line-legend-swatch" style={{ background: color }} />
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="line-chart-scroll">
                      <svg
                        viewBox={`0 0 ${trendChartWidth} ${trendChartHeight}`}
                        className="line-chart-svg"
                        role="img"
                        aria-label="エリア別分析の感情推移折れ線グラフ"
                      >
                        {trendGridPercents.map((value) => {
                          const y = toTrendY(value);
                          return (
                            <g key={`${selectedPrefecture}-${analysisLevel}-grid-${value}`}>
                              <line
                                x1={trendChartPadding.left}
                                y1={y}
                                x2={trendChartWidth - trendChartPadding.right}
                                y2={y}
                                className="line-chart-grid"
                              />
                              <text x={trendChartPadding.left - 8} y={y + 4} className="line-chart-y-label">
                                {value}
                              </text>
                            </g>
                          );
                        })}

                        {areaEmotionTrendSeries.map((point, index) => {
                          if (index !== 0 && index !== trendPointCount - 1 && index % trendTickInterval !== 0) {
                            return null;
                          }

                          const x = toTrendX(index);
                          return (
                            <g key={`${selectedPrefecture}-${analysisLevel}-x-${index}`}>
                              <line
                                x1={x}
                                y1={trendChartHeight - trendChartPadding.bottom}
                                x2={x}
                                y2={trendChartHeight - trendChartPadding.bottom + 5}
                                className="line-chart-axis-tick"
                              />
                              <text x={x} y={trendChartHeight - trendChartPadding.bottom + 18} className="line-chart-x-label">
                                {point.dateLabel}
                              </text>
                            </g>
                          );
                        })}

                        {trendEmotionLines.map((line) => (
                          <g key={`${selectedPrefecture}-${analysisLevel}-line-${line.label}`}>
                            <polyline points={line.points} className="line-chart-line" style={{ stroke: line.color }} />
                            {line.markers.map((marker, markerIndex) => (
                              <circle
                                key={`${selectedPrefecture}-${analysisLevel}-dot-${line.label}-${markerIndex}`}
                                cx={marker.x}
                                cy={marker.y}
                                r="2.8"
                                className="line-chart-dot"
                                style={{ fill: line.color }}
                              />
                            ))}
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="trend-metric-grid">
                <div className="metric-card">
                  <span>投票数（{analysisPeriodDays}日）</span>
                  <strong>{periodVotesTotal.toLocaleString()}件</strong>
                </div>
                <div className="metric-card">
                  <span>喜びの割合</span>
                  <strong>{currentRegionEmotionStats?.喜び ?? 0}%</strong>
                </div>
                <div className="metric-card">
                  <span>不安・心配の割合</span>
                  <strong>{currentRegionEmotionStats?.['不安・心配'] ?? 0}%</strong>
                </div>
                <div className="metric-card wide-card">
                  <span>最も多い感情</span>
                  <strong>
                    {Object.entries(currentRegionEmotionStats || []).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '喜び'}
                  </strong>
                </div>
              </div>

              <div className="emotion-breakdown">
                {Object.entries(currentRegionEmotionStats || [])
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, value]) => {
                    const color = areaEmotionOptions.find((item) => item.label === label)?.color || '#cbd5e1';
                    const count = areaEmotionCounts?.[label] ?? 0;

                    return (
                      <div key={`${selectedPrefecture}-${analysisLevel}-breakdown-${label}`} className="breakdown-row">
                        <div className="breakdown-label">
                          <span className="breakdown-dot" style={{ background: color }} />
                          <span>{label}</span>
                        </div>
                        <div className="breakdown-track">
                          <span className="breakdown-fill" style={{ width: `${value}%`, background: color }} />
                        </div>
                        <strong>{value}% ({count}件)</strong>
                      </div>
                    );
                  })}
              </div>

              <div className="emotion-tag-row">
                {Object.entries(currentRegionEmotionStats || {}).map(([label, value]) => (
                  <div key={`${selectedPrefecture}-${analysisLevel}-tag-${label}`} className="emotion-tag" style={{ background: areaEmotionOptions.find((item) => item.label === label)?.color || '#cbd5e1' }}>
                    {label} {value}% ({areaEmotionCounts?.[label] ?? 0}件)
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
                    <button type="button" className="submit-button" onClick={handleSubmitPost} disabled={isSubmittingPost}>
                      {isSubmittingPost ? '送信中...' : '投稿する'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="search-composer">
            <form className={`search-panel google-search-panel ${searchSuggestions.length === 0 ? 'no-suggestions' : ''}`} onSubmit={handleSearch}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={handleSearchInput}
                placeholder="地名を検索"
                aria-label="Place search"
                className="google-search-input"
              />
              <button type="submit" className="google-search-submit" aria-label="Search">
                ⌕
              </button>
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
          </div>

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
