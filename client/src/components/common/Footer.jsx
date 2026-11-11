import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, Clock, Award, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-rose-50/60 border-t border-rose-100 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">100% Fresh Guaranteed</h4>
              <p className="text-[11px] text-slate-500">Baked fresh on order & farm-fresh blooms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">On-Time Delivery</h4>
              <p className="text-[11px] text-slate-500">Same-day 2-hour & midnight slots</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Artisanal Craftsmanship</h4>
              <p className="text-[11px] text-slate-500">Master pastry chefs & florists</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Safe & Contactless</h4>
              <p className="text-[11px] text-slate-500">Tamper-proof insulated packaging</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12 border-b border-rose-100">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <span className="font-serif text-3xl font-bold text-slate-900">
                Fresh<span className="text-rose-600">bunch</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Your destination for gourmet handcrafted cakes, farm-fresh flower arrangements, and heartfelt personalized gifts. Every creation is prepared with artisanal love to make your celebrations unforgettable.
            </p>
            <div className="pt-2 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600" />
                <span className="font-semibold">+91 98765 43210</span> (Mon-Sun, 8 AM - 11 PM)
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-600" />
                <span>support@freshbunch.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Gourmet Cakes</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/category/cakes" className="hover:text-rose-600 transition">Belgian Truffle Cakes</Link></li>
              <li><Link to="/category/cakes" className="hover:text-rose-600 transition">Red Velvet Cheesecakes</Link></li>
              <li><Link to="/category/cakes" className="hover:text-rose-600 transition">Eggless Cakes</Link></li>
              <li><Link to="/category/cakes" className="hover:text-rose-600 transition">Midnight Birthday Cakes</Link></li>
              <li><Link to="/category/cakes" className="hover:text-rose-600 transition">Fresh Exotic Fruit Gateau</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Blooms & Combos</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/category/flowers" className="hover:text-rose-600 transition">Dutch Red Roses</Link></li>
              <li><Link to="/category/flowers" className="hover:text-rose-600 transition">Oriental Lilies & Carnations</Link></li>
              <li><Link to="/category/gift-combos" className="hover:text-rose-600 transition">Cake & Flower Combos</Link></li>
              <li><Link to="/category/gift-combos" className="hover:text-rose-600 transition">Teddy & Chocolate Hampers</Link></li>
              <li><Link to="/category/personalized-gifts" className="hover:text-rose-600 transition">Custom Acrylic 3D Lamps</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/track" className="hover:text-rose-600 transition">Live Order Tracking</Link></li>
              <li><Link to="/account" className="hover:text-rose-600 transition">My Account & Orders</Link></li>
              <li><Link to="/shop" className="hover:text-rose-600 transition">Serviceable Cities</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Freshbunch Gifting Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>for joyous celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
