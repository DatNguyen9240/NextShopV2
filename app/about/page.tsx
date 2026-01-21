import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Giới thiệu - NextShop",
  description: "NextShop — Nơi mua sắm trực tuyến tiện lợi, giá tốt và dịch vụ tận tâm.",
};

const stats = [
  { value: "50K+", label: "Sản phẩm" },
  { value: "100K+", label: "Khách hàng" },
  { value: "24/7", label: "Hỗ trợ" },
  { value: "2-48h", label: "Giao hàng" },
];

const values = [
  {
    icon: "👥",
    title: "Khách hàng là trọng tâm",
    description: "Mỗi quyết định của chúng tôi đều hướng tới sự hài lòng và tin tưởng của bạn.",
  },
  {
    icon: "🤝",
    title: "Minh bạch & Chính trực",
    description: "Không giấu giếm, không gian dối. Giá trị ghi, chất lượng đảm bảo.",
  },
  {
    icon: "⚡",
    title: "Chất lượng & Hiệu quả",
    description: "Quy trình tối ưu để bạn nhận được sản phẩm tốt nhất nhanh nhất.",
  },
  {
    icon: "🚀",
    title: "Sáng tạo & Cải tiến",
    description: "Luôn lắng nghe phản hồi để phát triển và cải thiện dịch vụ.",
  },
];

export default function AboutPage() {
  return (
    <main className="w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative w-full py-20 px-4 lg:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-rose-100 rounded-full">
            <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-rose-700">Chào mừng bạn đến với NextShop</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-6">
            Mua sắm thông minh
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi tạo ra trải nghiệm mua sắm trực tuyến dễ dàng, nhanh chóng và đáng tin cậy cho hàng triệu khách hàng.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/products/category"
              className="inline-flex items-center gap-2 px-8 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Khám phá sản phẩm
              <ChevronRight size={20} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-rose-600 mb-2">
                {stat.value}
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              🎯 Sứ mệnh của chúng tôi
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Cung cấp một nền tảng mua sắm trực tuyến tiên tiến, nơi khách hàng có thể tìm kiếm hàng trăm nghìn sản phẩm chất lượng cao với giá cạnh tranh, nhận được dịch vụ giao hàng nhanh chóng, và an tâm với bảo vệ quyền lợi khách hàng trong mọi giao dịch.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Giá trị cốt lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-8 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200 hover:border-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            👨‍💼 Đội ngũ chúng tôi
          </h2>
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8 lg:p-12 border border-rose-200">
            <p className="text-lg text-gray-700 leading-relaxed">
              Tập hợp những chuyên gia lành nghề trong lĩnh vực thương mại điện tử, công nghệ, logistics và chăm sóc khách hàng. Chúng tôi làm việc không ngừng để cải thiện dịch vụ và luôn sẵn sàng hỗ trợ bạn <span className="font-bold text-rose-600">24/7</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            📞 Liên hệ chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <a href="mailto:support@nextshop.local" className="text-rose-600 hover:text-rose-700 font-medium">
                support@nextshop.local
              </a>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">☎️</div>
              <h3 className="font-bold text-gray-900 mb-2">Hotline</h3>
              <a href="tel:1900-1234" className="text-blue-600 hover:text-blue-700 font-medium">
                1900 - 1234
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-600 to-rose-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Sẵn sàng mua sắm?
          </h2>
          <p className="text-lg text-rose-100 mb-8">
            Khám phá hàng nghìn sản phẩm chất lượng với giá tốt nhất hôm nay.
          </p>
          <Link
            href="/products/category"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Bắt đầu mua sắm
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
