/**
 * High-Performance Deterministic Dataset Generator (Pure JavaScript)
 * Supports 5,000 Doctors, 20,000 Products, and 50 records per month for October, September, August
 */

const SPECIALTIES = [
  'Kaya Chikitsa (Internal Medicine)',
  'Shalya Tantra (Surgery & Pain)',
  'Shalakya Tantra (ENT & Ophthalmology)',
  'Kaumarbhritya (Pediatrics)',
  'Panchakarma Detox',
  'Rasayana & Anti-Aging',
  'Stri Roga (Gynecology)',
  'Agada Tantra (Toxicology & Skin)',
];

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Vikram', 'Priya', 'Rohan', 'Kavya', 'Aditya', 'Meera',
  'Dev', 'Ishani', 'Siddharth', 'Neha', 'Rajesh', 'Pooja', 'Sunil', 'Divya',
  'Amit', 'Sneha', 'Manish', 'Ritu', 'Kiran', 'Shweta', 'Sanjay', 'Deepika'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Joshi', 'Patel', 'Nair', 'Deshmukh', 'Chhabra',
  'Bhatnagar', 'Tripathi', 'Iyer', 'Mukherjee', 'Reddy', 'Choudhury', 'Kulkarni'
];

const CITIES = ['Mumbai', 'New Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Jaipur', 'Varanasi', 'Kochi'];

const PRODUCT_PREFIXES = [
  'Amrutam Nari Soundarya', 'Amrutam Kuntal Care', 'Amrutam Bhringraj',
  'Amrutam Chyawanprash', 'Amrutam Braindex', 'Amrutam Ortho Key',
  'Amrutam Lozenge', 'Amrutam Skinkey', 'Amrutam Triphala', 'Amrutam Ashwagandha'
];

const PRODUCT_TYPES = ['Malt', 'Hair Oil', 'Syrup', 'Gold Dust', 'Capsules', 'Shampoo', 'Teas', 'Body Butter'];

// Generate 5,000 Doctors
export function generateDoctors(count = 5000, offset = 0) {
  const doctors = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let index = 0; index < count; index++) {
    const i = offset + index + 1;
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const specialty = SPECIALTIES[i % SPECIALTIES.length];
    const exp = 3 + (i % 35);
    const rating = parseFloat((4.0 + ((i % 10) / 10)).toFixed(1));
    const fee = 499 + (i % 15) * 100;
    const isAvailableToday = i % 2 === 0;

    const slots = [
      { id: `slot_${i}_1`, time: '09:00 AM', date: todayStr, isBooked: i % 7 === 0, isExpired: false },
      { id: `slot_${i}_2`, time: '11:30 AM', date: todayStr, isBooked: i % 5 === 0, isExpired: false },
      { id: `slot_${i}_3`, time: '03:00 PM', date: todayStr, isBooked: i % 3 === 0, isExpired: false },
      { id: `slot_${i}_4`, time: '06:30 PM', date: todayStr, isBooked: false, isExpired: false },
    ];

    doctors.push({
      id: `doc_${i}`,
      name: `Dr. ${firstName} ${lastName}`,
      specialty,
      experienceYears: exp,
      rating: Math.min(5.0, rating),
      consultationFee: fee,
      avatarUrl: `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80`,
      isAvailableToday,
      languages: ['English', 'Hindi', i % 2 === 0 ? 'Sanskrit' : 'Marathi'],
      location: CITIES[i % CITIES.length],
      slots,
    });
  }

  return doctors;
}

// Generate 20,000 Products
export function generateProducts(count = 20000, offset = 0) {
  const products = [];
  const categories = [
    'Chyawanprash', 'Hair Care', 'Skin & Beauty', 'Supplements', 'Teas & Juices', 'Oil & Ghee'
  ];
  const dosageForms = ['Syrup', 'Tablet', 'Oil', 'Powder', 'Capsule'];

  for (let index = 0; index < count; index++) {
    const i = offset + index + 1;
    const prefix = PRODUCT_PREFIXES[i % PRODUCT_PREFIXES.length];
    const type = PRODUCT_TYPES[i % PRODUCT_TYPES.length];
    const category = categories[i % categories.length];
    const price = 299 + (i % 50) * 40;
    const originalPrice = price + 150;
    const rating = parseFloat((4.1 + ((i % 9) / 10)).toFixed(1));
    const dosageForm = dosageForms[i % dosageForms.length];

    products.push({
      id: `prod_${i}`,
      title: `${prefix} ${type} #${i}`,
      category,
      price,
      originalPrice,
      rating: Math.min(5.0, rating),
      reviewsCount: 12 + (i % 400),
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&auto=format&fit=crop&q=80',
      dosageForm,
      isInStock: i % 12 !== 0,
      description: `Authentic Ayurvedic formulation infused with rare herbs for holistic wellbeing. Batch #${1000 + i}.`,
      benefits: ['Supports Immunity', '100% Herbal & Natural', 'No Chemical Additives'],
    });
  }

  return products;
}

// Generate Health Records (50 records per month for October 2026, September 2026, August 2026)
export function generateHealthRecords(itemsPerMonth = 50) {
  const records = [];
  const recordTypes = ['Lab Report', 'Prescription', 'Consultation', 'Vaccination', 'Allergy'];

  const targetMonths = [
    { name: 'October 2026', monthNum: '10', year: '2026' },
    { name: 'September 2026', monthNum: '09', year: '2026' },
    { name: 'August 2026', monthNum: '08', year: '2026' },
  ];

  let idCounter = 1;

  targetMonths.forEach((m) => {
    for (let i = 1; i <= itemsPerMonth; i++) {
      const type = recordTypes[i % recordTypes.length];
      const day = String(((i - 1) % 28) + 1).padStart(2, '0');
      const dateStr = `${m.year}-${m.monthNum}-${day}`;
      const doctorName = `Dr. ${FIRST_NAMES[idCounter % FIRST_NAMES.length]} ${LAST_NAMES[idCounter % LAST_NAMES.length]}`;

      let title = `${type} #${idCounter}`;
      let tags = ['#ayurveda', '#health'];
      if (type === 'Lab Report') {
        title = `Complete Blood & Prakriti Analysis #${idCounter}`;
        tags = ['#bloodtest', '#prakriti', '#dosha'];
      } else if (type === 'Prescription') {
        title = `Ayurvedic Herbal Treatment Plan #${idCounter}`;
        tags = ['#herbal', '#rasayana', '#prescription'];
      } else if (type === 'Consultation') {
        title = `Nadi Pariksha & Wellness Follow-up #${idCounter}`;
        tags = ['#nadipariksha', '#consultation', '#holistic'];
      } else if (type === 'Vaccination') {
        title = `Immunity & Herbal Shield Record #${idCounter}`;
        tags = ['#immunity', '#preventive'];
      } else if (type === 'Allergy') {
        title = `Pitta Sensitive Allergy Profile #${idCounter}`;
        tags = ['#pitta', '#skin', '#allergy'];
      }

      const hasAttachment = idCounter % 2 === 0;
      records.push({
        id: `rec_${idCounter}`,
        title,
        type,
        date: dateStr,
        monthYear: m.name,
        doctorName,
        tags,
        summary: `Patient consultation notes regarding Dosha balance, dietary regimen, and lifestyle advice. Record ID: ${idCounter}.`,
        attachmentType: hasAttachment ? (idCounter % 3 === 0 ? 'pdf' : 'image') : undefined,
        attachmentUrl: hasAttachment ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80' : undefined,
        attachmentTitle: hasAttachment ? `Medical_Report_${idCounter}.${idCounter % 3 === 0 ? 'pdf' : 'jpg'}` : undefined,
      });

      idCounter++;
    }
  });

  // Sort descending by date (October -> September -> August)
  records.sort((a, b) => b.date.localeCompare(a.date));

  return records;
}

export function generateHealthRecordsPage(offset = 0, count = 10) {
  const recordTypes = ['Lab Report', 'Prescription', 'Consultation', 'Vaccination', 'Allergy'];
  const records = [];

  for (let index = 0; index < count && offset + index < 10000; index++) {
    const id = offset + index + 1;
    const monthIndex = Math.floor((id - 1) / 334);
    const month = ['October', 'September', 'August'][Math.min(monthIndex, 2)];
    const monthNumber = String(Math.max(8, 10 - monthIndex)).padStart(2, '0');
    const type = recordTypes[id % recordTypes.length];
    records.push({
      id: `rec_${id}`,
      title: `${type} #${id}`,
      type,
      date: `2026-${monthNumber}-${String(((id - 1) % 28) + 1).padStart(2, '0')}`,
      monthYear: `${month} 2026`,
      doctorName: `Dr. ${FIRST_NAMES[id % FIRST_NAMES.length]} ${LAST_NAMES[id % LAST_NAMES.length]}`,
      tags: ['#ayurveda', '#health'],
      attachmentType: id % 2 === 0 ? 'image' : undefined,
      attachmentUrl: id % 2 === 0 ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80' : undefined,
    });
  }

  return records;
}

// Server-side Filtering & Pagination Helpers
export function fetchFilteredDoctors({ page = 1, limit = 10, search = '', category = '' } = {}) {
  const allDoctors = generateDoctors(500, 0);
  let filtered = allDoctors;

  if (category && !category.toLowerCase().includes('all') && !category.toLowerCase().includes('सभी')) {
    const catLower = category.toLowerCase().split(' ')[0];
    filtered = filtered.filter(
      (d) =>
        d.specialty?.toLowerCase().includes(catLower) ||
        d.name?.toLowerCase().includes(catLower)
    );
  }

  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 0;
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages && data.length > 0,
  };
}

export function fetchFilteredProducts({ page = 1, limit = 10, search = '', category = '', sortOption = 'recommended' } = {}) {
  const allProducts = generateProducts(500, 0);
  let filtered = allProducts;

  if (category && !category.toLowerCase().includes('all') && !category.toLowerCase().includes('सभी')) {
    const catLower = category.toLowerCase().split(' ')[0];
    filtered = filtered.filter(
      (p) =>
        p.category?.toLowerCase().includes(catLower) ||
        p.title?.toLowerCase().includes(catLower)
    );
  }

  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  filtered = [...filtered].sort((first, second) => {
    if (sortOption === 'priceAsc') return first.price - second.price;
    if (sortOption === 'priceDesc') return second.price - first.price;
    if (sortOption === 'ratingDesc') return second.rating - first.rating;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 0;
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages && data.length > 0,
  };
}

export function fetchFilteredHealthRecords({ page = 1, limit = 10, search = '', category = '' } = {}) {
  const allRecords = generateHealthRecords(50);
  let filtered = allRecords;

  if (category && !category.toLowerCase().includes('all') && !category.toLowerCase().includes('सभी')) {
    filtered = filtered.filter((r) => r.type?.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.doctorName?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q) ||
        r.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // Sort latest record at top (date descending)
  filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 0;
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages && data.length > 0,
  };
}

