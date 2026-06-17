import { toAbsoluteUrl } from "@/_metronic/helpers";
import { HeroCategories } from "./HeroCategories";

export const HeroSection = () => {
    return (
        <div className="w-full flex-col flex items-center bg-[#f7f8fa] py-16 px-4 md:px-8 rounded-2xl mb-12">
            <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Context Info & Search */}
                <div className="flex flex-col gap-8 w-full lg:w-8/12 xl:w-9/12">
                    <div className="flex flex-col gap-6">
                        <h1 className="text-[#18191c] text-5xl md:text-6xl font-medium leading-tight">
                            Bạn có một đề xuất?
                        </h1>
                        <p className="text-[#5e6670] text-lg max-w-[536px]">
                            Hãy chia sẻ ngay với chúng tôi.
                        </p>
                    </div>

                    <HeroCategories />
                </div>

                {/* Illustration Placeholder */}
                <div className="w-full lg:w-4/12 xl:w-3/12 flex justify-center lg:justify-end">
                    <div className="w-full max-w-[350px] aspect-square bg-[#e7f0fa] rounded-full flex items-center justify-center relative overflow-hidden">
                        <img src={toAbsoluteUrl("media/illustrations/portal/hero.png")} alt="Hero Illustration" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                </div>
            </div>
        </div>
    );
};
