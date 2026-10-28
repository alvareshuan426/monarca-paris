// Каталог MONARCA.PARIS.
// Цены — ориентировочные, замените на свои. Фото лежат в assets/products/.
// Чтобы добавить товар: положите фото в assets/products/ и добавьте объект в массив.

window.MONARCA_CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'claw', label: 'Крабы' },
  { id: 'butterfly', label: 'Бабочки' },
  { id: 'mini', label: 'Мини' },
  { id: 'comb', label: 'Гребни' },
  { id: 'case', label: 'Футляры' }
];

window.MONARCA_PRODUCTS = [
  {
    id: 'bordeaux',
    name: 'Bordeaux',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3490,
    colour: 'Глубокий бордовый',
    description: 'Крупный краб с зеркальным глянцем. Под верхней створкой — прозрачный шарнир с золотистой пружиной: именно эта заколка собирается в начале страницы.',
    images: ['bordeaux-2', 'bordeaux-4', 'bordeaux-3', 'bordeaux-1', 'bordeaux-5']
  },
  {
    id: 'noir',
    name: 'Noir',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3490,
    colour: 'Чёрный глянец',
    description: 'Та же форма, что у Bordeaux, в чёрном цвете. Строгая заколка, которая подходит к любому образу.',
    images: ['noir-2', 'noir-1']
  },
  {
    id: 'leopard',
    name: 'Léopard',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3290,
    colour: 'Леопардовый принт',
    description: 'Классический леопард на золотисто-медовом фоне с рыжими пятнами. Длинные зубцы держат объёмные волосы.',
    images: ['leopard-3', 'leopard-1', 'leopard-2']
  },
  {
    id: 'leopard-rose',
    name: 'Léopard Rose',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3290,
    colour: 'Розовый леопард',
    description: 'Леопардовый рисунок в малиновых и розовых тонах на полупрозрачной основе.',
    images: ['leopard-rose-3', 'leopard-rose-1', 'leopard-rose-2']
  },
  {
    id: 'creme',
    name: 'Crème Fleurie',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3990,
    colour: 'Кремовый с голубыми цветами',
    description: 'Сливочный краб с объёмными цветами, кристаллами и золотистыми бусинами. На обратной стороне рычагов — дорожка из страз.',
    images: ['creme-2', 'creme-1', 'creme-3', 'creme-4']
  },
  {
    id: 'fleurs-peche',
    name: 'Pêche Fleurie',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3990,
    colour: 'Персиковый мрамор с белыми цветами',
    description: 'Персиково-розовый мраморный узор, белые цветы со стразами и жемчужная дорожка на рычаге.',
    images: ['fleurs-peche-1', 'fleurs-peche-2', 'fleurs-peche-3']
  },
  {
    id: 'duo-rose-blanc',
    name: 'Duo',
    kind: 'Краб для волос',
    category: 'claw',
    price: 3690,
    colour: 'Розовый и молочный',
    description: 'Двухцветный краб: одна створка розовая, другая — молочная, обе с мелкими кристаллами.',
    images: ['duo-rose-blanc-1']
  },
  {
    id: 'papillon-rose',
    name: 'Papillon Rose',
    kind: 'Заколка-бабочка',
    category: 'butterfly',
    price: 2490,
    colour: 'Розовый перламутр',
    description: 'Краб в форме бабочки с перламутровыми крыльями и золотистой пружиной в прозрачном корпусе.',
    images: ['papillon-rose-2', 'papillon-rose-1']
  },
  {
    id: 'papillon-blanc',
    name: 'Papillon Blanc',
    kind: 'Заколка-бабочка',
    category: 'butterfly',
    price: 2490,
    colour: 'Молочный перламутр',
    description: 'Бабочка в молочно-белом перламутре — светлая пара к Papillon Rose.',
    images: ['papillon-blanc-1', 'papillon-blanc-2', 'papillon-blanc-3', 'papillon-blanc-4']
  },
  {
    id: 'mini-bordeaux-rose',
    name: 'Mini Duo Bordeaux',
    kind: 'Набор из двух мини-крабов',
    category: 'mini',
    price: 1990,
    colour: 'Бордовый и нежно-розовый',
    description: 'Две маленькие заколки для прядей у лица или небольшого пучка.',
    images: ['mini-bordeaux-rose-3', 'mini-bordeaux-rose-1', 'mini-bordeaux-rose-2']
  },
  {
    id: 'duo-gris-rose',
    name: 'Mini Duo Gris',
    kind: 'Набор из двух мини-крабов',
    category: 'mini',
    price: 1990,
    colour: 'Серый мрамор и розовый',
    description: 'Мини-крабы в паре: дымчато-серый мраморный и молочно-розовый.',
    images: ['duo-gris-rose-1', 'duo-gris-rose-3', 'duo-gris-rose-2']
  },
  {
    id: 'peigne-rose',
    name: 'Peigne Rose',
    kind: 'Гребень для волос',
    category: 'comb',
    price: 2290,
    colour: 'Розовый мрамор',
    description: 'Гребень с широкими зубьями в розово-молочном мраморе. Удобно лежит в руке и помещается в сумку.',
    images: ['peigne-rose-3', 'peigne-rose-4', 'peigne-rose-1', 'peigne-rose-2']
  },
  {
    id: 'peigne-dalmatien',
    name: 'Dalmatien',
    kind: 'Гребень для волос',
    category: 'comb',
    price: 2290,
    colour: 'Чёрно-белый',
    description: 'Тот же гребень с широкими зубьями — в графичном чёрно-белом узоре.',
    images: ['peigne-dalmatien-3', 'peigne-dalmatien-4', 'peigne-dalmatien-1', 'peigne-dalmatien-2']
  },
  {
    id: 'etui-rouge',
    name: 'Étui Rouge',
    kind: 'Футляр для аксессуаров',
    category: 'case',
    price: 2990,
    colour: 'Красный, фактура «под крокодила»',
    description: 'Круглый футляр с ручкой-петлёй и крупной жемчужиной на крышке. Подойдёт для хранения заколок и как подарочная упаковка.',
    images: ['etui-rouge-1']
  }
];
