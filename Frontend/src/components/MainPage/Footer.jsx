import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Phone,
  Mail,
  HeartPulse,
  ArrowUp,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4 w-full overflow-hidden relative text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Logo & Socials */}
          <div>
            <div className="flex items-center mb-2">
              <HeartPulse className="text-[#4a90e2] w-6 h-6 mr-2" />
              <span className="text-lg font-bold">MedConnect</span>
            </div>
            <p className="text-gray-400 mb-2">
              Connecting you with quality healthcare services anytime, anywhere.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-[#4a90e2]"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              {[
                "Find a Doctor",
                "Book Appointment",
                "Our Services",
                "Health Blog",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-bold mb-2">Contact Us</h3>
            <ul className="space-y-1 text-gray-400">
              <li className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>IIIT Srikakulam, Srikakulam</span>
              </li>
              <li className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>+91 9652253431</span>
              </li>
              <li className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>support@medconnect.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-3 mt-4 text-xs text-center md:text-left">
          <p className="text-gray-400">
            © 2024 MedConnect. All rights reserved.
          </p>
          <div className="flex space-x-3 justify-center md:justify-end mt-2 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (policy) => (
                <a
                  key={policy}
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  {policy}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-[#4a90e2] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#357abd] shadow-lg transition-all"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}
