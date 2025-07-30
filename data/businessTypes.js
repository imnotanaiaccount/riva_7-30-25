// Comprehensive business types ranked by relevance to digital/web/marketing services
// Higher priority = more likely to need digital services and higher potential value

export const businessTypes = [
  // HIGH PRIORITY - Digital-first businesses
  'Ecommerce', 'SaaS', 'Mobile App', 'Web Application', 'Digital Agency', 'Marketing Agency', 'Tech Startup', 'Online Course', 'Digital Product', 'Subscription Service',
  
  // HIGH PRIORITY - Service businesses that heavily rely on digital presence
  'Real Estate', 'Law Firm', 'Healthcare', 'Dental Practice', 'Medical Practice', 'Financial Advisor', 'Insurance Agency', 'Mortgage Broker', 'Accounting Firm', 'Consulting',
  
  // HIGH PRIORITY - Creative and professional services
  'Design Agency', 'Photography', 'Videography', 'Graphic Design', 'Web Design', 'Branding Agency', 'PR Agency', 'Content Creation', 'Social Media Agency', 'SEO Agency',
  
  // HIGH PRIORITY - Retail and consumer services
  'Restaurant', 'Cafe', 'Bakery', 'Food Truck', 'Retail Store', 'Boutique', 'Jewelry Store', 'Fashion Brand', 'Beauty Salon', 'Spa',
  
  // MEDIUM-HIGH PRIORITY - Local service businesses
  'Fitness Studio', 'Yoga Studio', 'Personal Trainer', 'Dance Studio', 'Music School', 'Tutoring', 'Childcare', 'Pet Care', 'Cleaning Service', 'Landscaping',
  
  // MEDIUM-HIGH PRIORITY - Professional services
  'Architecture Firm', 'Engineering Firm', 'Construction Company', 'Interior Design', 'Event Planning', 'Wedding Planning', 'Catering', 'Photography Studio', 'Videography Studio', 'Audio Production',
  
  // MEDIUM PRIORITY - Health and wellness
  'Mental Health Practice', 'Physical Therapy', 'Chiropractic', 'Nutritionist', 'Personal Trainer', 'Wellness Coach', 'Life Coach', 'Therapist', 'Counselor', 'Alternative Medicine',
  
  // MEDIUM PRIORITY - Education and training
  'Online Education', 'Language School', 'Coding Bootcamp', 'Art School', 'Cooking School', 'Driving School', 'Trade School', 'Corporate Training', 'Workshop Provider', 'Seminar Host',
  
  // MEDIUM PRIORITY - Entertainment and media
  'Podcast', 'YouTube Channel', 'Streaming Service', 'Gaming Company', 'Music Production', 'Film Production', 'Theater Company', 'Comedy Club', 'Event Venue', 'Entertainment Agency',
  
  // MEDIUM PRIORITY - Home and lifestyle
  'Home Decor', 'Furniture Store', 'Kitchen Remodeling', 'Bathroom Remodeling', 'Home Staging', 'Interior Design', 'Garden Center', 'Plant Nursery', 'Home Improvement', 'DIY Workshop',
  
  // MEDIUM PRIORITY - Automotive and transportation
  'Car Dealership', 'Auto Repair', 'Car Wash', 'Auto Detailing', 'Towing Service', 'Transportation Service', 'Moving Company', 'Delivery Service', 'Logistics Company', 'Fleet Management',
  
  // MEDIUM PRIORITY - Technology and IT
  'IT Consulting', 'Software Development', 'Web Development', 'Mobile Development', 'Cybersecurity', 'Data Analytics', 'Cloud Services', 'IT Support', 'Network Services', 'Digital Transformation',
  
  // MEDIUM PRIORITY - Financial services
  'Investment Firm', 'Venture Capital', 'Private Equity', 'Cryptocurrency', 'Fintech', 'Payment Processing', 'Credit Union', 'Bank', 'Tax Preparation', 'Bookkeeping',
  
  // MEDIUM PRIORITY - Manufacturing and industrial
  'Manufacturing', 'Industrial Supply', 'Equipment Rental', 'Tool Supply', 'Safety Equipment', 'Industrial Services', 'Quality Control', 'Supply Chain', 'Distribution', 'Warehousing',
  
  // MEDIUM PRIORITY - Food and beverage
  'Catering Company', 'Food Delivery', 'Meal Prep', 'Organic Food', 'Specialty Food', 'Beverage Company', 'Coffee Roaster', 'Winery', 'Brewery', 'Distillery',
  
  // MEDIUM PRIORITY - Fashion and beauty
  'Fashion Designer', 'Clothing Brand', 'Accessories Brand', 'Shoe Store', 'Jewelry Designer', 'Cosmetics Brand', 'Skincare Brand', 'Hair Salon', 'Nail Salon', 'Barber Shop',
  
  // MEDIUM PRIORITY - Sports and recreation
  'Sports Club', 'Gym', 'Fitness Center', 'Swimming Pool', 'Tennis Club', 'Golf Course', 'Ski Resort', 'Adventure Tours', 'Outdoor Equipment', 'Sports Training',
  
  // MEDIUM PRIORITY - Travel and tourism
  'Travel Agency', 'Hotel', 'Resort', 'Vacation Rental', 'Tour Guide', 'Adventure Company', 'Cruise Line', 'Airline', 'Car Rental', 'Tourism Board',
  
  // MEDIUM PRIORITY - Non-profit and community
  'Nonprofit Organization', 'Charity', 'Foundation', 'Community Center', 'Religious Organization', 'School', 'University', 'Library', 'Museum', 'Cultural Center',
  
  // MEDIUM PRIORITY - Government and public services
  'Government Agency', 'Public Service', 'Municipal Services', 'Public Safety', 'Emergency Services', 'Public Health', 'Public Works', 'Parks and Recreation', 'Public Library', 'Public Transportation',
  
  // LOWER PRIORITY - Specialized services
  'Pet Grooming', 'Veterinary Clinic', 'Animal Hospital', 'Pet Store', 'Dog Walking', 'Pet Sitting', 'Animal Rescue', 'Pet Training', 'Pet Photography', 'Pet Supplies',
  
  // LOWER PRIORITY - Niche markets
  'Antique Store', 'Vintage Shop', 'Thrift Store', 'Consignment Shop', 'Collectibles', 'Hobby Shop', 'Game Store', 'Comic Book Store', 'Record Store', 'Bookstore',
  
  // LOWER PRIORITY - Specialized professional services
  'Translation Service', 'Interpretation Service', 'Language School', 'Cultural Center', 'Immigration Services', 'Legal Aid', 'Notary Public', 'Court Reporter', 'Process Server', 'Bail Bonds',
  
  // LOWER PRIORITY - Home services
  'Plumbing Service', 'Electrical Service', 'HVAC Service', 'Roofing Company', 'Pest Control', 'Security System', 'Locksmith', 'Appliance Repair', 'Handyman Service', 'Home Inspection',
  
  // LOWER PRIORITY - Business services
  'Office Supply', 'Printing Service', 'Sign Company', 'Promotional Products', 'Business Consulting', 'HR Services', 'Recruitment Agency', 'Staffing Agency', 'Payroll Service', 'Background Check',
  
  // LOWER PRIORITY - Specialized retail
  'Hardware Store', 'Lumber Yard', 'Paint Store', 'Flooring Store', 'Window Company', 'Door Company', 'Siding Company', 'Gutter Company', 'Deck Company', 'Fence Company',
  
  // LOWER PRIORITY - Specialized manufacturing
  'Custom Manufacturing', '3D Printing', 'Laser Cutting', 'CNC Machining', 'Metal Fabrication', 'Woodworking', 'Plastic Manufacturing', 'Textile Manufacturing', 'Food Manufacturing', 'Chemical Manufacturing',
  
  // LOWER PRIORITY - Specialized technology
  'AI Company', 'Machine Learning', 'Blockchain', 'IoT Company', 'Robotics', 'Drone Service', 'Virtual Reality', 'Augmented Reality', 'Gaming Company', 'Esports',
  
  // LOWER PRIORITY - Specialized health
  'Telemedicine', 'Medical Device', 'Pharmaceutical', 'Biotechnology', 'Medical Research', 'Clinical Trial', 'Medical Equipment', 'Medical Supply', 'Medical Software', 'Health Tech',
  
  // LOWER PRIORITY - Specialized education
  'Online University', 'Coding School', 'Design School', 'Business School', 'Medical School', 'Law School', 'Trade School', 'Vocational School', 'Special Education', 'Adult Education',
  
  // LOWER PRIORITY - Specialized entertainment
  'Escape Room', 'Virtual Reality Arcade', 'Gaming Cafe', 'Board Game Cafe', 'Comic Convention', 'Anime Convention', 'Gaming Convention', 'Music Festival', 'Film Festival', 'Art Festival',
  
  // LOWER PRIORITY - Specialized food
  'Food Truck', 'Pop-up Restaurant', 'Ghost Kitchen', 'Meal Kit Service', 'Food Subscription', 'Specialty Coffee', 'Tea Company', 'Juice Bar', 'Smoothie Bar', 'Ice Cream Shop',
  
  // LOWER PRIORITY - Specialized fashion
  'Sustainable Fashion', 'Vintage Clothing', 'Custom Clothing', 'Wedding Dress', 'Bridal Shop', 'Maternity Wear', 'Plus Size Fashion', 'Athletic Wear', 'Swimwear', 'Lingerie',
  
  // LOWER PRIORITY - Specialized beauty
  'Organic Beauty', 'Vegan Beauty', 'Cruelty-Free Beauty', 'Natural Skincare', 'Anti-Aging', 'Acne Treatment', 'Hair Loss Treatment', 'Tattoo Studio', 'Piercing Studio', 'Permanent Makeup',
  
  // LOWER PRIORITY - Specialized fitness
  'CrossFit Gym', 'Yoga Studio', 'Pilates Studio', 'Barre Studio', 'Spin Studio', 'Boxing Gym', 'Martial Arts', 'Dance Studio', 'Swimming Lessons', 'Tennis Lessons',
  
  // LOWER PRIORITY - Specialized travel
  'Luxury Travel', 'Adventure Travel', 'Eco Tourism', 'Cultural Tours', 'Food Tours', 'Wine Tours', 'Photography Tours', 'Educational Tours', 'Volunteer Travel', 'Solo Travel',
  
  // LOWER PRIORITY - Specialized services
  'Virtual Assistant', 'Personal Assistant', 'Concierge Service', 'Lifestyle Management', 'Personal Shopping', 'Wardrobe Styling', 'Image Consulting', 'Etiquette Training', 'Public Speaking', 'Voiceover',
  
  // CATCH-ALL OPTIONS
  'Other', 'Custom', 'Not Listed'
];

// Priority scoring function (higher score = higher priority)
export const getBusinessTypePriority = (businessType) => {
  const highPriority = ['Ecommerce', 'SaaS', 'Digital Agency', 'Marketing Agency', 'Tech Startup', 'Real Estate', 'Law Firm', 'Healthcare', 'Restaurant', 'Fitness Studio'];
  const mediumHighPriority = ['Design Agency', 'Photography', 'Consulting', 'Retail Store', 'Beauty Salon', 'Event Planning', 'Architecture Firm', 'Mental Health Practice', 'Online Education', 'Podcast'];
  
  if (highPriority.includes(businessType)) return 3;
  if (mediumHighPriority.includes(businessType)) return 2;
  return 1;
};

// Smart filtering function that prioritizes relevant matches
export const filterBusinessTypes = (searchTerm, limit = 50) => {
  if (!searchTerm) {
    // Return top priority items when no search term
    return businessTypes
      .sort((a, b) => getBusinessTypePriority(b) - getBusinessTypePriority(a))
      .slice(0, limit);
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  // First, find exact matches
  const exactMatches = businessTypes.filter(type => 
    type.toLowerCase() === searchLower
  );
  
  // Then, find starts-with matches
  const startsWithMatches = businessTypes.filter(type => 
    type.toLowerCase().startsWith(searchLower) && !exactMatches.includes(type)
  );
  
  // Then, find contains matches
  const containsMatches = businessTypes.filter(type => 
    type.toLowerCase().includes(searchLower) && 
    !exactMatches.includes(type) && 
    !startsWithMatches.includes(type)
  );
  
  // Combine and sort by priority
  const allMatches = [...exactMatches, ...startsWithMatches, ...containsMatches];
  
  return allMatches
    .sort((a, b) => {
      // First sort by match quality
      const aExact = exactMatches.includes(a);
      const bExact = exactMatches.includes(b);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStartsWith = startsWithMatches.includes(a);
      const bStartsWith = startsWithMatches.includes(b);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort by priority
      return getBusinessTypePriority(b) - getBusinessTypePriority(a);
    })
    .slice(0, limit);
}; 