import Layout from '../components/Layout';
import LeadMagnet from '../components/LeadMagnet';

export default function LeadMagnetPage() {
  return (
    <Layout>
      <div className="min-h-screen py-8 pt-24">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Free Lead Magnet
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock the secrets to scaling your business with our exclusive resource. 
              Get instant access to proven strategies that drive real results.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Benefits */}
              <div className="space-y-6">
                <div className="glass p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    What You'll Get:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-3 mt-1">✓</span>
                      <span className="text-gray-300">Proven strategies for business growth</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-3 mt-1">✓</span>
                      <span className="text-gray-300">Step-by-step implementation guide</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-3 mt-1">✓</span>
                      <span className="text-gray-300">Real case studies and examples</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-3 mt-1">✓</span>
                      <span className="text-gray-300">Actionable tips you can use today</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-3 mt-1">✓</span>
                      <span className="text-gray-300">Exclusive insights from industry experts</span>
                    </li>
                  </ul>
                </div>

                <div className="glass p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Why This Works:
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This resource is based on real-world experience and proven methodologies. 
                    We've helped hundreds of businesses scale their operations and increase their revenue. 
                    Now it's your turn to benefit from these strategies.
                  </p>
                </div>
              </div>

              {/* Right side - Form */}
              <div>
                <LeadMagnet />
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <div className="glass p-8 rounded-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">
                Trusted by Business Owners Worldwide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                  <div className="text-gray-300 text-sm">Downloads This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
                  <div className="text-gray-300 text-sm">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                  <div className="text-gray-300 text-sm">Instant Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 