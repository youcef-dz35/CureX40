// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  email_verified_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export enum UserRole {
  PATIENT = 'patient',
  PHARMACIST = 'pharmacist',
  GOVERNMENT_OFFICIAL = 'government_official',
  INSURANCE_PROVIDER = 'insurance_provider',
  ADMIN = 'admin',
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  accept_terms?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Medication types
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  brand: string;
  description: string;
  dosage: string;
  form: MedicationForm;
  category: MedicationCategory;
  activeIngredients: string[];
  contraindications?: string[];
  sideEffects?: string[];
  price: number;
  currency: string;
  stock: number;
  minStock: number;
  requiresPrescription: boolean;
  images: string[];
  manufacturer: string;
  expiryDate: string;
  batchNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum MedicationForm {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  LIQUID = 'liquid',
  INJECTION = 'injection',
  CREAM = 'cream',
  OINTMENT = 'ointment',
  DROPS = 'drops',
  INHALER = 'inhaler',
  PATCH = 'patch',
  SUPPOSITORY = 'suppository',
}

export enum MedicationCategory {
  ANALGESICS = 'analgesics',
  ANTIBIOTICS = 'antibiotics',
  ANTIHISTAMINES = 'antihistamines',
  ANTACIDS = 'antacids',
  VITAMINS = 'vitamins',
  CARDIOVASCULAR = 'cardiovascular',
  RESPIRATORY = 'respiratory',
  DERMATOLOGICAL = 'dermatological',
  GASTROINTESTINAL = 'gastrointestinal',
  NEUROLOGICAL = 'neurological',
  HORMONAL = 'hormonal',
  OTHER = 'other',
}

// Prescription types
export interface Prescription {
  id: string;
  patientId: string;
  patient: User;
  doctorName: string;
  doctorLicense: string;
  medications: PrescriptionMedication[];
  notes?: string;
  issueDate: string;
  expiryDate: string;
  status: PrescriptionStatus;
  verificationStatus: VerificationStatus;
  pharmacistId?: string;
  pharmacist?: User;
  verifiedAt?: string;
  rejectionReason?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedication {
  medicationId: string;
  medication: Medication;
  quantity: number;
  dosageInstructions: string;
  duration: string;
  frequency: string;
}

export enum PrescriptionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Order types
export interface Order {
  id: string;
  patientId: string;
  patient: User;
  items: OrderItem[];
  prescriptionId?: string;
  prescription?: Prescription;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryAddress: Address;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  estimatedDelivery: string;
  actualDelivery?: string;
  pharmacyId: string;
  pharmacy: Pharmacy;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  medicationId: string;
  medication: Medication;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  DIGITAL_WALLET = 'digital_wallet',
}

export enum DeliveryMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  PICKUP = 'pickup',
  SAME_DAY = 'same_day',
}

// Pharmacy types
export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  operatingHours: OperatingHours[];
  services: PharmacyService[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  coordinates: Coordinates;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OperatingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  isClosed: boolean;
}

export enum PharmacyService {
  PRESCRIPTION_FILLING = 'prescription_filling',
  MEDICATION_COUNSELING = 'medication_counseling',
  HEALTH_SCREENING = 'health_screening',
  VACCINATIONS = 'vaccinations',
  DELIVERY = 'delivery',
  CONSULTATION = 'consultation',
  COMPOUNDING = 'compounding',
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SearchFilters {
  query?: string;
  category?: MedicationCategory;
  form?: MedicationForm;
  requiresPrescription?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  manufacturer?: string;
}

// Notification types
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}



// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

// IoT Smart Shelf types
export interface SmartShelf {
  id: string;
  pharmacyId: string;
  shelfCode: string;
  location: string;
  temperature: number;
  humidity: number;
  capacity: number;
  currentStock: number;
  medications: ShelfMedication[];
  sensors: ShelfSensor[];
  status: ShelfStatus;
  lastMaintenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfMedication {
  medicationId: string;
  medication: Medication;
  quantity: number;
  position: ShelfPosition;
  expiryDate: string;
  batchNumber: string;
  fifoOrder: number;
  lastDispensed?: string;
}

export interface ShelfPosition {
  row: number;
  column: number;
  depth: number;
}

export interface ShelfSensor {
  id: string;
  type: SensorType;
  value: number;
  unit: string;
  threshold: SensorThreshold;
  status: SensorStatus;
  lastReading: string;
}

export enum ShelfStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  ERROR = 'error',
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  WEIGHT = 'weight',
  MOTION = 'motion',
  CAMERA = 'camera',
}

export interface SensorThreshold {
  min: number;
  max: number;
  unit: string;
}

export enum SensorStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline',
}

// AI Recommendation types
export interface MolecularRecommendation {
  id: string;
  originalMedicationId: string;
  recommendedMedicationId: string;
  confidence: number;
  reason: RecommendationType;
  activeIngredients: string[];
  equivalencyScore: number;
  priceDifference: number;
  availabilityScore: number;
  patientCompatibility: number;
  createdAt: string;
}

export enum RecommendationType {
  GENERIC_ALTERNATIVE = 'generic_alternative',
  BRAND_EQUIVALENT = 'brand_equivalent',
  THERAPEUTIC_SUBSTITUTE = 'therapeutic_substitute',
  DOSAGE_FORM_ALTERNATIVE = 'dosage_form_alternative',
  STOCK_AVAILABILITY = 'stock_availability',
  COST_EFFECTIVE = 'cost_effective',
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  impact: ImpactLevel;
  actionRequired: boolean;
  recommendations: string[];
  affectedEntities: string[];
  createdAt: string;
  expiresAt?: string;
}

export enum InsightType {
  STOCK_PREDICTION = 'stock_prediction',
  DEMAND_FORECAST = 'demand_forecast',
  EXPIRY_ALERT = 'expiry_alert',
  INTERACTION_WARNING = 'interaction_warning',
  COST_OPTIMIZATION = 'cost_optimization',
  SUPPLY_SHORTAGE = 'supply_shortage',
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Insurance Claim types
export interface InsuranceClaim {
  id: string;
  patientId: string;
  patient: User;
  prescriptionId: string;
  prescription: Prescription;
  orderId: string;
  order: Order;
  insuranceProvider: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount: number;
  deductible: number;
  copayment: number;
  status: ClaimStatus;
  submissionDate: string;
  processingDate?: string;
  approvalDate?: string;
  paymentDate?: string;
  rejectionReason?: string;
  fraudRisk: FraudRisk;
  documents: ClaimDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  DISPUTED = 'disputed',
}

export interface FraudRisk {
  score: number;
  level: FraudLevel;
  factors: FraudFactor[];
  verificationStatus: VerificationStatus;
  lastChecked: string;
}

export enum FraudLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  SUSPICIOUS = 'suspicious',
}

export interface FraudFactor {
  type: string;
  description: string;
  riskScore: number;
  severity: ImpactLevel;
}

export interface ClaimDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  verified: boolean;
  uploadedAt: string;
}

export enum DocumentType {
  PRESCRIPTION = 'prescription',
  RECEIPT = 'receipt',
  INSURANCE_CARD = 'insurance_card',
  MEDICAL_REPORT = 'medical_report',
  IDENTIFICATION = 'identification',
}

// Government Dashboard types
export interface NationalHealthMetrics {
  totalPharmacies: number;
  activePharmacies: number;
  totalMedications: number;
  medicationsInStock: number;
  medicationsShortage: number;
  totalPrescriptions: number;
  processedClaims: number;
  averageWaitTime: number;
  supplyCoverage: number;
  lastUpdated: string;
}

export interface RegionMetrics {
  regionId: string;
  regionName: string;
  pharmacyCount: number;
  populationCoverage: number;
  stockLevel: number;
  shortageAlerts: number;
  averageAccessTime: number;
  healthOutcomes: HealthOutcome[];
  coordinates: Coordinates;
}

export interface HealthOutcome {
  metric: string;
  value: number;
  unit: string;
  trend: TrendDirection;
  period: string;
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

export interface SupplyChainAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  medicationId: string;
  medication: Medication;
  affectedRegions: string[];
  estimatedShortfall: number;
  estimatedDuration: string;
  recommendedActions: string[];
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
}

export enum AlertType {
  SHORTAGE = 'shortage',
  RECALL = 'recall',
  QUALITY_ISSUE = 'quality_issue',
  SUPPLY_DISRUPTION = 'supply_disruption',
  DEMAND_SURGE = 'demand_surge',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

// Digital Health Vault types
export interface HealthVault {
  id: string;
  patientId: string;
  vitallsIntegrationId?: string;
  healthRecords: HealthRecord[];
  medications: VaultMedication[];
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  vitalSigns: VitalSign[];
  accessPermissions: VaultPermission[];
  encryptionKey: string;
  lastSync: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  type: RecordType;
  title: string;
  description?: string;
  fileUrl?: string;
  metadata: Record<string, unknown>;
  providerId?: string;
  providerName?: string;
  recordDate: string;
  createdAt: string;
}

export enum RecordType {
  LAB_RESULT = 'lab_result',
  IMAGING = 'imaging',
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  PRESCRIPTION = 'prescription',
  OTHER = 'other',
}

export interface VaultMedication {
  medicationId: string;
  medication: Medication;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  dosage: string;
  frequency: string;
  prescriberId: string;
  prescriberName: string;
  status: MedicationStatus;
  adherence: number;
  sideEffectsReported: string[];
}

export enum MedicationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DISCONTINUED = 'discontinued',
  PAUSED = 'paused',
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: AllergySeverity;
  symptoms: string[];
  diagnosedDate?: string;
  notes?: string;
}

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening',
}

export interface ChronicCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  status: ConditionStatus;
  medications: string[];
  managementPlan?: string;
  lastReview?: string;
}

export enum ConditionStatus {
  ACTIVE = 'active',
  IN_REMISSION = 'in_remission',
  RESOLVED = 'resolved',
  MONITORING = 'monitoring',
}

export interface VitalSign {
  id: string;
  type: VitalType;
  value: number;
  unit: string;
  recordedDate: string;
  recordedBy?: string;
  notes?: string;
}

export enum VitalType {
  BLOOD_PRESSURE = 'blood_pressure',
  HEART_RATE = 'heart_rate',
  TEMPERATURE = 'temperature',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BLOOD_GLUCOSE = 'blood_glucose',
  OXYGEN_SATURATION = 'oxygen_saturation',
}

export interface VaultPermission {
  id: string;
  grantedTo: string;
  grantedToType: PermissionGranteeType;
  permissions: VaultAccessType[];
  expiresAt?: string;
  grantedAt: string;
  revokedAt?: string;
}

export enum PermissionGranteeType {
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  PHARMACY = 'pharmacy',
  INSURANCE_PROVIDER = 'insurance_provider',
  RESEARCHER = 'researcher',
  FAMILY_MEMBER = 'family_member',
}

export enum VaultAccessType {
  READ = 'read',
  WRITE = 'write',
  SHARE = 'share',
  EMERGENCY = 'emergency',
}

// Cart types
export interface CartItem {
  medication: Medication;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
