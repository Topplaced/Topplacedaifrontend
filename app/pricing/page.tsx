'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Rocket,
  ArrowRight,
  Target,
  
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import PaymentModal from '@/components/PaymentModal';

export default function PricingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    plan: any;
  }>({ isOpen: false, plan: null });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  

  const handleInterviewPurchase = (interview: any) => {
    const planData = {
      name: interview.name,
      price: interview.price, // Send amount in Rupees (backend handles conversion)
      features: interview.features,
      orderType: 'credits',
      creditPackage: `${interview.duration}min_interview`,
      duration: interview.duration
    };
    setPaymentModal({ isOpen: true, plan: planData });
  };

  const handleCreditPackPurchase = (pack: any) => {
    const planData = {
      name: pack.name,
      price: pack.price, // Send amount in Rupees (backend handles conversion)
      features: [`${pack.credits} interview credits`, `${pack.duration}-minute interviews`, `Save ₹${pack.savings}`],
      orderType: 'credits',
      creditPackage: `${pack.type}_pack_${pack.credits}`,
      duration: pack.duration
    };
    setPaymentModal({ isOpen: true, plan: planData });
  };

  const handlePaymentSuccess = () => {
    // Handle successful payment - could redirect to dashboard or show success message
    alert('Payment successful! Your plan has been activated.');
    // You might want to redirect to dashboard or refresh user data
  };

  const interviewPricing = [
    {
      name: '30 Min Interview',
      price: 39,
      duration: 30,
      icon: Target,
      description: 'Quick focused interview practice',
      popular: false,
      features: [
        '30-minute AI interview session',
        'Basic scorecard analysis',
        'Standard question bank',
        'Email support',
        'Essential feedback'
      ]
    },
    {
      name: '45 Min Interview',
      price: 49,
      duration: 45,
      icon: Zap,
      description: 'Comprehensive interview experience',
      popular: true,
      features: [
        '45-minute AI interview session',
        'Detailed scorecard analysis',
        'Industry-specific questions',
        'Priority support',
        'Advanced feedback & tips'
      ]
    },
    {
      name: '60 Min Interview',
      price: 59,
      duration: 60,
      icon: Crown,
      description: 'In-depth interview preparation',
      popular: false,
      features: [
        '60-minute AI interview session',
        'Comprehensive analysis',
        'Custom interview scenarios',
        'Detailed performance metrics',
        'Personalized improvement plan'
      ]
    },
    {
      name: '90 Min Interview',
      price: 69,
      duration: 90,
      icon: Crown,
      description: 'Complete interview mastery',
      popular: false,
      features: [
        '90-minute AI interview session',
        'Full comprehensive analysis',
        'Advanced interview scenarios',        
        'Complete skill assessment',
        'Premium feedback insights',
        'Comprehensive improvement feedback',
        'Professional-grade feedback'
      ]
    }
  ];

  const creditPacks = [
    {
      name: '5 x 30-Min Interviews',
      price: 175,
      originalPrice: 195,
      savings: 20,
      credits: 5,
      type: '30min',
      duration: 30
    },
    {
      name: '5 x 45-Min Interviews',
      price: 220,
      originalPrice: 245,
      savings: 25,
      credits: 5,
      type: '45min',
      duration: 45
    },
    {
      name: '5 x 60-Min Interviews',
      price: 265,
      originalPrice: 295,
      savings: 30,
      credits: 5,
      type: '60min',
      duration: 60
    },
    {
      name: '5 x 90-Min Interviews',
      price: 310,
      originalPrice: 345,
      savings: 35,
      credits: 5,
      type: '90min',
      duration: 90
    }
  ];
  

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-full mb-6">
              <Star size={16} className="text-[#00FFB2] mr-2" />
              <span className="text-sm font-medium text-[#00FFB2]">Transparent Pricing</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Choose Your <span className="gradient-text">Growth Plan</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              {/* <div className="bg-[#1A1A1A] p-1 rounded-lg flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    billingCycle === 'monthly' 
                      ? 'bg-[#00FFB2] text-black font-semibold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md transition-all relative ${
                    billingCycle === 'yearly' 
                      ? 'bg-[#00FFB2] text-black font-semibold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div> */}
            </div>
          </div>

          {/* Per-Interview Pricing */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">
              Pay Per <span className="gradient-text">Interview</span>
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12">
              Choose the interview experience that fits your needs
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              {interviewPricing.map((interview, index) => {
                const IconComponent = interview.icon;
                
                return (
                  <div
                    key={index}
                    className={`glass-card p-8 relative transition-all duration-300 hover:scale-105 ${
                      interview.popular ? 'border-2 border-[#00FFB2] neon-glow' : ''
                    }`}
                  >
                    {interview.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-[#00FFB2] text-black px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent size={32} className="text-[#00FFB2]" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">{interview.name}</h3>
                      <p className="text-gray-400 mb-6">{interview.description}</p>
                      
                      <div className="mb-6">
                        <div className="text-4xl font-bold">
                          ₹{interview.price}
                          <span className="text-lg text-gray-400 font-normal">/interview</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {interview.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <Check size={16} className="text-[#00FFB2] mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleInterviewPurchase(interview)}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                        interview.popular
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      Buy Interview
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Credit Packs */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">
                Credit Packs - <span className="gradient-text">Better Value</span>
              </h3>
              <p className="text-lg text-gray-300">
                Buy in bulk and save on your interview practice
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {creditPacks.map((pack, index) => (
                <div
                   key={index}
                   className="glass-card p-6 transition-all duration-300 hover:scale-105"
                 >
                   <div className="text-center">
                     <h4 className="text-xl font-bold mb-2">{pack.name}</h4>
                     <div className="mb-2">
                       <span className="text-3xl font-bold">₹{pack.price}</span>
                       <span className="text-gray-400 ml-2">for {pack.credits} interviews</span>
                     </div>
                     {pack.savings > 0 && (
                       <div className="mb-2">
                         <span className="text-sm line-through text-gray-500">₹{pack.originalPrice}</span>
                         <span className="text-sm text-green-400 ml-2">Save ₹{pack.savings}</span>
                       </div>
                     )}
                     <p className="text-sm text-gray-400 mb-4">₹{Math.round(pack.price / pack.credits)} per {pack.duration}-min interview</p>
                     
                     <button
                       onClick={() => handleCreditPackPurchase(pack)}
                       className="w-full py-3 px-6 rounded-lg font-semibold btn-primary transition-all duration-300"
                     >
                       Buy Credit Pack
                     </button>
                   </div>
                 </div>
              ))}
            </div>
          </div>

          

          

          {/* FAQ Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-12">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-6 text-left">
                <h3 className="text-lg font-semibold mb-3">Can I change plans anytime?</h3>
                <p className="text-gray-400">Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
              </div>
              
              <div className="glass-card p-6 text-left">
                <h3 className="text-lg font-semibold mb-3">Is there a free trial?</h3>
                <p className="text-gray-400">Our Starter plan is completely free forever. You can also try Professional features with a 7-day free trial.</p>
              </div>
              
              <div className="glass-card p-6 text-left">
                <h3 className="text-lg font-semibold mb-3">How does AI interview matching work?</h3>
                <p className="text-gray-400">Our system studies your profile and adapts interview questions and feedback to match your career objectives and improvement areas.</p>
              </div>
              
              <div className="glass-card p-6 text-left">
                <h3 className="text-lg font-semibold mb-3">What payment methods do you accept?</h3>
                <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="glass-card p-12 text-center neon-glow">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of professionals who are already growing with Top placed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary flex items-center justify-center px-8 py-4 text-lg">
                Start Your Journey
                <Rocket size={20} className="ml-2" />
              </Link>
              <Link href="/auth/login" className="btn-outline flex items-center justify-center px-8 py-4 text-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, plan: null })}
        plan={paymentModal.plan}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
