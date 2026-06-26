import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/modules/auth";
import { Form, message, Spin } from "antd";

import { Step1SelectDonVi } from "./components/nop-sang-kien/Step1SelectDonVi";
import { Step2FormSangKien } from "./components/nop-sang-kien/Step2FormSangKien";
import { Step3Success } from "./components/nop-nhiem-vu/Step3Success";
import { requestPOST } from "@/utils/baseAPI";
import { IPaginationResponse, IResult, TrangThaiHoSoSangKien } from "@/models";
import { toSaveDate } from "@/utils/utils";
import dayjs from "dayjs";

export const NopSangKienPage = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [donViId, setDonViId] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dotXetSangKien, setDotXetSangKien] = useState<any>(null);
  const [isFetchingDot, setIsFetchingDot] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchLatestDot = async () => {
      try {
        setIsFetchingDot(true);
        const res = await requestPOST<IPaginationResponse<any[]>>(`dotxetsangkiens/search`, {
          pageNumber: 1,
          pageSize: 1,
          capQuanLyCode: "CAP_CO_SO",
          dangDienRa: true
        });
        if (res.data?.data && res.data.data.length > 0) {
          setDotXetSangKien(res.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching latest dot:", error);
      } finally {
        setIsFetchingDot(false);
      }
    };
    fetchLatestDot();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  // Xử lý Gửi hồ sơ
  const onFinish = async (values: any) => {
    if (!dotXetSangKien) {
      message.error("Hiện tại không có đợt đăng ký sáng kiến nào đang mở!");
      return;
    }

    setLoading(true);
    try {
      // Tự động thêm tác giả mặc định nếu danh sách trống
      let tacGias = values.tacGias || [];
      if (tacGias.length === 0) {
        tacGias = [{
          hoTen: currentUser?.fullName || currentUser?.userName,
          chucDanhId: null,
          donViCongTac: "",
          tyLeDongGop: 100,
          thanhVienId: currentUser?.id
        }];
      }

      // Xây dựng dữ liệu gửi đi giống hệt DangKySangKienDetailModal.tsx
      const formData = {
        ...values,
        dotXetSangKienId: dotXetSangKien.id,
        donViDuocYeuCauId: donViId,
        ngayDuocApDungLanDau: toSaveDate(values.ngayDuocApDungLanDau),
        ngayNopHoSo: toSaveDate(dayjs()),
        nguoiNopHoSoId: currentUser?.id,
        trangThai: TrangThaiHoSoSangKien.ChoTiepNhan,
        thanhViens: [
          ...tacGias.map((item: any) => ({
            ...item,
            ngaySinh: item.ngaySinh ? toSaveDate(item.ngaySinh) : null,
            thamGiaApDungThu: false
          })),
          ...(values.thanhVienThamGiaApDungThus || []).map((item: any) => ({
            ...item,
            ngaySinh: item.ngaySinh ? toSaveDate(item.ngaySinh) : null,
            thamGiaApDungThu: true
          }))
        ]
      };

      const response = await requestPOST<IResult<string>>(`HoSoSangKiens`, formData);

      if (response?.data?.succeeded) {
        const fullId = response.data.data;
        const shortCode = fullId?.length > 12 ? fullId.slice(-12).toUpperCase() : fullId;
        setTicketCode(shortCode);
        setStep(3);
      } else {
        message.error(response?.data?.message || "Gửi hồ sơ thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Đã có lỗi xảy ra khi gửi hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra đăng nhập
  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <i className="fa-solid fa-lock text-6xl text-gray-300 mb-6"></i>
        <p className="text-red-600 font-bold text-xl mb-6">Bạn cần đăng nhập để thực hiện chức năng này!</p>
        <Link to="/auth/login" className="bg-portal-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-portal-hover transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Đang kiểm tra đợt xét
  if (isFetchingDot) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <Spin size="large" tip="Đang kiểm tra đợt đăng ký..." />
      </div>
    );
  }

  // Kiểm tra đợt xét sáng kiến
  if (!dotXetSangKien) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <i className="fa-solid fa-calendar-xmark text-6xl text-gray-300 mb-6"></i>
        <p className="text-red-600 font-bold text-xl mb-6 text-center">
          Hiện tại không có đợt yêu cầu công nhận sáng kiến nào đang mở.<br /> Vui lòng quay lại sau!
        </p>
        <Link to="/doi-moi/trang-chu" className="bg-portal-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-portal-hover transition-colors">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const steps = [
    { id: 1, title: "Chọn đơn vị phê duyệt" },
    { id: 2, title: "Nhập thông tin sáng kiến" },
    { id: 3, title: "Hoàn thành" },
  ];

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 w-full">
        <div className="bg-white rounded-t-xl border-b border-gray-100 p-8 shadow-2xs">
          <h1 className="text-2xl lg:text-3xl font-medium text-center text-[#18191c] mb-12">
            Yêu cầu công nhận sáng kiến
          </h1>

          <div className="flex items-center justify-center max-w-3xl mx-auto mb-4">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors z-10 bg-white
                                        ${step === s.id ? 'border-portal-primary bg-white text-portal-primary shadow-2xs' :
                      step > s.id ? 'border-portal-primary bg-portal-primary text-white' : 'border-gray-200 text-gray-400'}`}>
                    {step > s.id ? <i className="fa-solid fa-check"></i> : s.id}
                  </div>
                  <span className={`absolute top-12 whitespace-nowrap text-[13px] font-medium
                                        ${step === s.id ? 'text-portal-primary' : step > s.id ? 'text-portal-primary' : 'text-gray-400'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-[2px] w-20 md:w-32 lg:w-48 transition-colors ${step > s.id ? 'bg-portal-primary' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-2xs p-6 lg:p-10 min-h-[500px] border-x border-b border-gray-100">
          {step === 1 && (
            <Step1SelectDonVi donViId={donViId} setDonViId={setDonViId} setStep={setStep} />
          )}

          {step === 2 && (
            <Step2FormSangKien form={form} onFinish={onFinish} setStep={setStep} currentUser={currentUser} loading={loading} dotXetSangKien={dotXetSangKien} />
          )}

          {step === 3 && (
            <Step3Success ticketCode={ticketCode} copied={copied} setCopied={setCopied} submissionType="initiative" />
          )}
        </div>
      </div>
    </div>
  );
};
