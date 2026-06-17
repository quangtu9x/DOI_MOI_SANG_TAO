import { toAbsoluteUrl } from "@/_metronic/helpers";

export const sliderData = [
  {
    id: 1,
    title: "Khai trương Hệ thống quản lý trực tuyến các nhiệm vụ KH&CN theo thời gian thực",
    description: "Hệ thống giúp tối ưu hóa quy trình quản lý và theo dõi tiến độ các nhiệm vụ khoa học công nghệ.",
    image: toAbsoluteUrl("media/portal/slide-1.jpg"),
    link: "#"
  },
  {
    id: 2,
    title: "Kết nối nghiên cứu KH&CN, thúc đẩy hệ sinh thái ĐMST quốc gia",
    description: "Thúc đẩy sự hợp tác giữa các đơn vị nghiên cứu và doanh nghiệp.",
    image: toAbsoluteUrl("media/portal/slide-2.jpg"),
    link: "#"
  },
  {
    id: 3,
    title: "Hoàn thiện cơ chế quản lý và nâng cao năng lực KH&CN quốc gia",
    description: "Đổi mới sáng tạo trong quản lý khoa học và công nghệ năm 2025.",
    image: toAbsoluteUrl("media/portal/slide-3.jpg"),
    link: "#"
  }
];

export const statisticsData = [
  { label: "Nhiệm vụ đã nộp", value: 1250, icon: "fa-regular fa-file-import" },
  { label: "Nhiệm vụ được tài trợ", value: 840, icon: "fa-regular fa-hand-holding-dollar" },
  { label: "Nhiệm vụ đã hoàn thành", value: 620, icon: "fa-regular fa-check-double" },
  { label: "Sáng kiến công nhận", value: 450, icon: "fa-regular fa-lightbulb" }
];
