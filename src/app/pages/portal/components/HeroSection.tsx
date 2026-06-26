import { toAbsoluteUrl } from "@/_metronic/helpers";
import { HeroCategories } from "./HeroCategories";

export const HeroSection = () => {
    return (
        <div className="w-full flex-col flex items-center bg-gradient-to-br from-[#e8f0fe] via-[#f0f4ff] to-[#f7f8fa] py-16 px-4 md:px-8 rounded-2xl mb-12">
            <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Left: Text & Categories */}
                <div className="flex flex-col gap-8 w-full lg:w-8/12 xl:w-9/12">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 bg-[#0a65cc]/10 text-[#0a65cc] text-sm font-semibold px-4 py-1.5 rounded-full w-fit">
                            <i className="fa-regular fa-rocket text-xs" />
                            Cổng Đổi mới sáng tạo
                        </div>
                        <h1 className="text-[#18191c] text-4xl md:text-5xl font-semibold leading-tight">
                            Ý tưởng của bạn<br />
                            <span className="text-[#0a65cc]">nâng tầm Vietnam Airlines</span>
                        </h1>
                        <p className="text-[#374151] text-lg max-w-[520px]">
                            Mỗi cán bộ, nhân viên đều có thể đóng góp sáng kiến cải tiến vận hành, dịch vụ và an toàn bay. Ý tưởng của bạn được lắng nghe, thẩm định và triển khai thực tế.
                        </p>
                    </div>
                    <HeroCategories />
                </div>

                {/* Right: Illustration */}
                <div className="w-full lg:w-4/12 xl:w-3/12 flex justify-center lg:justify-end">
                    <div className="w-full max-w-[320px] aspect-square bg-[#0a65cc]/10 rounded-full flex items-center justify-center relative overflow-hidden">
                        <div className="flex flex-col items-center gap-3 p-8">
                            <i className="fa-regular fa-lightbulb text-[#0a65cc]" style={{ fontSize: 72 }} />
                            <div className="text-[#0a65cc] font-semibold text-center text-sm">Đổi mới · Sáng tạo · Phát triển</div>
                        </div>
                        <img
                            src={toAbsoluteUrl("media/illustrations/portal/hero.png")}
                            alt="Hero Illustration"
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
