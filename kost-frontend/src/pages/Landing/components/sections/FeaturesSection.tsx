import React from 'react';
import { Wifi, Shield, Car, Coffee, MapPin, Clock } from 'lucide-react';

interface FeaturesSectionProps {
  className?: string;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  className = ''
}) => {
  const features = [
    { 
      icon: Wifi, 
      title: "WiFi Cepat", 
      description: "Internet 100 Mbps untuk semua kebutuhan",
      color: "bg-teal-400/20 text-teal-600"
    },
    { 
      icon: Shield, 
      title: "Keamanan 24/7", 
      description: "CCTV dan sistem keamanan terpadu",
      color: "bg-teal-400/20 text-teal-600"
    },
    { 
      icon: Car, 
      title: "Parkir Gratis", 
      description: "Area parkir motor dan mobil",
      color: "bg-teal-400/20 text-teal-600"
    },
    { 
      icon: Coffee, 
      title: "Dapur Bersama", 
      description: "Fasilitas memasak dengan peralatan lengkap",
      color: "bg-teal-400/20 text-teal-600"
    },
    { 
      icon: MapPin, 
      title: "Lokasi Strategis", 
      description: "Dekat kampus UI dan stasiun KRL",
      color: "bg-teal-400/20 text-teal-600"
    },
    { 
      icon: Clock, 
      title: "Akses 24 Jam", 
      description: "Kebebasan keluar masuk kapan saja",
      color: "bg-teal-400/20 text-teal-600"
    }
  ];

  // Removed fake statistics - will be updated with real data when available

  return (
    <section id="features" className={`py-16 lg:py-24 bg-blue-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
            Fasilitas Lengkap
          </h2>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk hidup nyaman sudah tersedia
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-blue-200"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-blue-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;