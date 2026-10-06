import { Store } from './store';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000).toISOString();

const properties = [
  {
    title: 'Marble Crest Villa', category: 'Villa', type: 'sale', price: 1850000, city: 'Islamabad', area: 'F-7 Markaz',
    address: 'Street 12, F-7/2, Islamabad', beds: 6, baths: 7, sqft: 7200, featured: true, status: 'available',
    description: 'A sculpted marble villa with double-height living spaces, a private cinema, a heated infinity pool and a landscaped courtyard that opens to the Margalla hills. Every room is wrapped in natural light.',
    amenities: ['Infinity pool', 'Private cinema', 'Smart home', 'Garden', 'Gym', '4-car garage'],
    images: [img('photo-1613490493576-7fde63acd811'), img('photo-1600596542815-ffad4c1539a9'), img('photo-1600607687939-ce8a6c25118c')],
  },
  {
    title: 'Skyline Penthouse', category: 'Penthouse', type: 'sale', price: 2900000, city: 'Dubai', area: 'Downtown Dubai',
    address: 'Boulevard Heights, Downtown Dubai', beds: 4, baths: 5, sqft: 5100, featured: true, status: 'available',
    description: 'Full-floor penthouse with 360-degree skyline views, a wraparound terrace, a private lift lobby and concierge service from the building lobby to your door.',
    amenities: ['Private terrace', 'Concierge', 'Private lift', 'Sky lounge', 'Spa', 'Valet'],
    images: [img('photo-1512917774080-9991f1c4c750'), img('photo-1600585154340-be6161a56a0c'), img('photo-1502672260266-1c1ef2d93688')],
  },
  {
    title: 'Garden Terrace Residence', category: 'House', type: 'sale', price: 760000, city: 'Lahore', area: 'DHA Phase 6',
    address: 'Block C, DHA Phase 6, Lahore', beds: 5, baths: 5, sqft: 4500, featured: true, status: 'available',
    description: 'A warm family home with a sunken lounge, a chef kitchen and terraces on every level, set on a quiet tree-lined street close to schools and parks.',
    amenities: ['Terrace garden', 'Chef kitchen', 'Solar panels', 'Servant quarter', 'Study'],
    images: [img('photo-1564013799919-ab600027ffc6'), img('photo-1580587771525-78b9dba3b914'), img('photo-1600566753190-17f0baa2a6c3')],
  },
  {
    title: 'Seaview Signature Apartment', category: 'Apartment', type: 'rent', price: 4200, city: 'Karachi', area: 'Clifton Block 4',
    address: 'Emaar Crescent Bay, Clifton, Karachi', beds: 3, baths: 3, sqft: 2400, featured: true, status: 'available',
    description: 'Fully furnished sea-facing apartment with floor-to-ceiling glass, a private balcony and access to the beach club, pool and fitness studio.',
    amenities: ['Sea view', 'Furnished', 'Beach club', 'Pool', 'Gym', '24/7 security'],
    images: [img('photo-1502672260266-1c1ef2d93688'), img('photo-1522708323590-d24dbb6b0267'), img('photo-1560448204-e02f11c3d0e2')],
  },
  {
    title: 'The Olive Courtyard House', category: 'House', type: 'sale', price: 540000, city: 'Islamabad', area: 'Bahria Town Phase 4',
    address: 'Street 5, Bahria Town Phase 4, Islamabad', beds: 4, baths: 4, sqft: 3300, featured: false, status: 'available',
    description: 'Mediterranean-inspired home built around an olive courtyard, with arched windows, a reading loft and a generous covered veranda.',
    amenities: ['Courtyard', 'Reading loft', 'Veranda', 'Solar panels'],
    images: [img('photo-1568605114967-8130f3a36994'), img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600585154363-67eb9e2e2099')],
  },
  {
    title: 'Palm Harbour Villa', category: 'Villa', type: 'rent', price: 11500, city: 'Dubai', area: 'Palm Jumeirah',
    address: 'Frond K, Palm Jumeirah, Dubai', beds: 5, baths: 6, sqft: 6000, featured: true, status: 'available',
    description: 'Beachfront villa on the Palm with a private jetty, outdoor kitchen, staff suite and pool deck that steps directly onto the sand.',
    amenities: ['Private beach', 'Jetty', 'Outdoor kitchen', 'Staff suite', 'Pool'],
    images: [img('photo-1613977257363-707ba9348227'), img('photo-1600607687939-ce8a6c25118c'), img('photo-1600566753086-00f18fb6b3ea')],
  },
  {
    title: 'Executive Loft Suites', category: 'Apartment', type: 'sale', price: 310000, city: 'Lahore', area: 'Gulberg III',
    address: 'MM Alam Road, Gulberg III, Lahore', beds: 2, baths: 2, sqft: 1500, featured: false, status: 'available',
    description: 'Modern loft apartments with high ceilings, brick-and-glass detailing and a rooftop lounge, minutes from the best cafes and offices in Gulberg.',
    amenities: ['Rooftop lounge', 'Backup power', 'Covered parking', 'Gym'],
    images: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1560448204-e02f11c3d0e2'), img('photo-1493809842364-78817add7ffb')],
  },
  {
    title: 'Hillcrest Land Parcel', category: 'Land', type: 'sale', price: 420000, city: 'Islamabad', area: 'Park Road',
    address: 'Park Road, Islamabad', beds: 0, baths: 0, sqft: 10890, featured: false, status: 'available',
    description: 'Rare 1-kanal-plus corner parcel with mountain views, all utilities in place and clear title, ready for your own design.',
    amenities: ['Corner plot', 'Utilities ready', 'Clear title', 'Mountain view'],
    images: [img('photo-1500382017468-9049fed747ef'), img('photo-1506905925346-21bda4d32df4'), img('photo-1469474968028-56623f02e42e')],
  },
  {
    title: 'Mayfair Corner Townhouse', category: 'House', type: 'sale', price: 2150000, city: 'London', area: 'Mayfair',
    address: 'Curzon Street, Mayfair, London', beds: 5, baths: 4, sqft: 3900, featured: true, status: 'available',
    description: 'Restored Georgian townhouse with period cornices, a modern glass extension and a quiet walled garden in the heart of Mayfair.',
    amenities: ['Walled garden', 'Wine cellar', 'Lift', 'Home office'],
    images: [img('photo-1600585154526-990dced4db0d'), img('photo-1600573472592-401b489a3cdc'), img('photo-1600210492486-724fe5c67fb0')],
  },
];

const inquiries = [
  { name: 'Ayesha Khan', email: 'ayesha@example.com', phone: '+92 300 1234567', message: 'I would like to visit this villa this weekend with my family. Is Saturday afternoon possible?', budget: 1900000, status: 'new', score: 90, grade: 'Hot', createdAt: daysAgo(1) },
  { name: 'Omar Siddiqui', email: 'omar@example.com', phone: '', message: 'Please share the floor plan.', budget: 2500000, status: 'contacted', score: 60, grade: 'Warm', createdAt: daysAgo(12) },
  { name: 'Sara Malik', email: 'sara@example.com', phone: '+92 321 7654321', message: 'Is the rent negotiable for a 2 year lease? We are relocating from Dubai next month.', budget: 3800, status: 'closed', score: 65, grade: 'Warm', createdAt: daysAgo(35) },
  { name: 'Hamza Tariq', email: 'hamza@example.com', phone: '+92 333 9988776', message: 'Interested in the land parcel, can you send the title documents and survey map?', budget: 450000, status: 'new', score: 100, grade: 'Hot', createdAt: daysAgo(3) },
  { name: 'Lina Ahmed', email: 'lina@example.com', phone: '', message: 'Price?', budget: 0, status: 'new', score: 20, grade: 'Cold', createdAt: daysAgo(55) },
  { name: 'Daniel Reed', email: 'daniel@example.com', phone: '+44 7700 900123', message: 'Looking for a London townhouse for our family, please call me to discuss viewing options.', budget: 2100000, status: 'contacted', score: 85, grade: 'Hot', createdAt: daysAgo(75) },
];

export async function seedIfEmpty(store: Store) {
  if ((await store.list('properties')).length === 0) {
    for (let i = 0; i < properties.length; i++) {
      await store.create('properties', { ...properties[i], createdAt: daysAgo(properties.length - i) });
    }
    console.log(`Seeded ${properties.length} properties`);
  }
  if ((await store.list('inquiries')).length === 0) {
    const first = (await store.list('properties'))[0];
    for (const q of inquiries) await store.create('inquiries', { ...q, propertyId: first?.id || '', propertyTitle: first?.title || 'General inquiry' });
  }
}
