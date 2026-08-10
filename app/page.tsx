"use client";

import { ArrowRight, Zap, Droplet, Wind, Clock, Award, MapPin, Phone, Mail } from 'lucide-react';
import ChatWidget from './components/ChatWidget';

export default function Home() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-500/30">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-sm font-semibold">24/7 Emergency Service Available</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Desert Air HVAC & Plumbing
          </h1>

          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Licensed, bonded, and serving Henderson since 2009. When your AC fails in 110° heat, we show up. Fast.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="tel:7025550147" className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl">
              <Phone className="w-5 h-5" />
              (702) 555-0147
            </a>
            <button onClick={() => (document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement)?.click()} className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-all border-2 border-white">
              Book Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>4.9★ · 200+ Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>Same-Day Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              What We Fix
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive HVAC and plumbing solutions for Henderson homes and businesses
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wind,
                title: 'AC Repair & Installation',
                description: 'Broken AC in 115° heat? We dispatch in 45 minutes. Full replacements and preventive maintenance too.'
              },
              {
                icon: Zap,
                title: 'Heating Systems',
                description: 'Gas furnace, heat pump, or electric—we handle all heating types. Winter prep and emergency fixes.'
              },
              {
                icon: Droplet,
                title: 'Plumbing Repair',
                description: 'Leaks, clogs, burst pipes. Our licensed plumbers arrive ready to solve it same-day.'
              },
              {
                icon: Droplet,
                title: 'Drain Cleaning',
                description: 'Video inspection included. We clear blockages and prevent future clogs with preventive service.'
              },
              {
                icon: Zap,
                title: 'Water Heater Install',
                description: 'Tank or tankless. We size, install, and warranty all work. Upfront pricing, no surprises.'
              },
              {
                icon: Clock,
                title: '24/7 Emergency Service',
                description: 'Pipe burst at midnight? AC failure on the hottest day? We answer our phone around the clock.'
              }
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">15+</div>
              <div className="text-blue-100">Years Serving Henderson</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">Licensed</div>
              <div className="text-blue-100">& Insured • BBB A+</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">4.9★</div>
              <div className="text-blue-100">200+ Reviews Online</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">Same-Day</div>
              <div className="text-blue-100">Emergency Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              We Serve the Las Vegas Valley
            </h2>
            <p className="text-xl text-slate-600">
              Fast response across Henderson, Las Vegas, Paradise, and surrounding areas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                'Henderson',
                'Las Vegas',
                'Paradise',
                'Spring Valley',
                'Boulder City',
                'North Las Vegas',
                'Summerlin',
                'Red Rock Area'
              ].map((city, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-medium text-slate-800">{city}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-8 rounded-xl border border-blue-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Can't find your area?
              </h3>
              <p className="text-slate-600 mb-6">
                Call us anyway. If you're within 30 miles of Henderson, we'll do our best to help or refer you to someone we trust.
              </p>
              <a href="tel:7025550147" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors">
                <Phone className="w-4 h-4" />
                (702) 555-0147
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Ready to Fix It?
          </h2>
          <p className="text-lg text-orange-100 mb-8">
            No upfront fees. No hidden charges. Just honest, fast, professional work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:7025550147" className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 transition-colors">
              <Phone className="w-5 h-5" />
              Call Now
            </a>
            <button onClick={() => (document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement)?.click()} className="inline-flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors border-2 border-white border-opacity-30">
              Chat with Us
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Desert Air HVAC</h3>
              <p className="text-sm text-slate-400">
                Licensed, bonded, insured. Serving Henderson since 2009.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Services</h4>
              <ul className="text-sm space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">AC Repair</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Heating</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Plumbing</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Emergency Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="text-sm space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:7025550147" className="hover:text-orange-400 transition-colors">(702) 555-0147</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:dispatch@desertair.local" className="hover:text-orange-400 transition-colors">dispatch@desertair.local</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Hours</h4>
              <p className="text-sm text-slate-400">
                <span className="block">Mon–Fri: 7am–9pm</span>
                <span className="block">Sat–Sun: 8am–8pm</span>
                <span className="block mt-2 font-semibold text-orange-400">24/7 Emergency Dispatch</span>
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
              <p>© 2024 Desert Air HVAC & Plumbing. All rights reserved.</p>
              <div className="flex gap-4 mt-4 sm:mt-0">
                <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </main>
  );
}

function Star({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
