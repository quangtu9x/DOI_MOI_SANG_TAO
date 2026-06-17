import { STATUS_CODE } from "@/data";
import dayjs, { Dayjs } from "dayjs";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export const getStatusColor = (status: string) => {
    return status === STATUS_CODE.ACTIVE ? "green" : "red";
  };


export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

export const getGuideTypeColor = (type: string) => {
  switch (type) {

    default:
      return "gray"
  }
}

export const getGuideTypeLabel = (type: string) => {
  switch (type) {

    default:
      return type
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const getSurveyStatus = (startDate: Dayjs, endDate: Dayjs) => {
  const now = dayjs()
  const start = dayjs(startDate, "YYYY-MM-DD")
  const end = dayjs(endDate, "YYYY-MM-DD")

  if (now < start) return "upcoming"
  if (now > end) return "ended"
  return "ongoing"
}

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "upcoming":
      return {
        label: "Chưa bắt đầu",
        color: "blue",
        icon: Clock,
      }
    case "ongoing":
      return {
        label: "Đang diễn ra",
        color: "green",
        icon: CheckCircle,
      }
    case "ended":
      return {
        label: "Đã kết thúc",
        color: "gray",
        icon: XCircle,
      }
    default:
      return {
        label: "Không xác định",
        color: "gray",
        icon: Clock,
      }
  }
}

export const getRatingText = (rating: number) => {
  const ratingTexts = [
    "Chưa đánh giá",
    "Rất không hài lòng",
    "Không hài lòng",
    "Bình thường",
    "Hài lòng",
    "Rất hài lòng"
  ]
  return ratingTexts[rating] || ratingTexts[0]
}
