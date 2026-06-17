import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/modules/auth";
import { Form, Spin, message } from "antd";
import { toast } from "react-toastify";

import { requestGET, requestPOST } from "@/utils/baseAPI";
import { Step1FormThongTin } from "./components/nop-du-an-cntt/Step1FormThongTin";
import { Step2DuToan } from "./components/nop-du-an-cntt/Step2DuToan";
import { Step3Success } from "./components/nop-nhiem-vu/Step3Success";
import { IResult, IChiTietDuToan } from "@/models";
import { convertImage } from "@/utils/utils";

export const NopDuAnCNTTPage = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [ticketCode, setTicketCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);

  const hotRef = useRef<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  // Xử lý Gửi hồ sơ
  const onFinish = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const hotInstance = hotRef.current?.hotInstance;
      const chiTietData = hotInstance ? hotInstance.getSourceData() : tableData;
      const formData = {
        ...values,
        dinhKem: convertImage(fileList),
        chiTietDuToans: chiTietData.map((item: any) => ({
          danhMucChiPhiId: item.isCustom ? null : item.id,
          ten: item.ten,
          stt: item.stt,
          kyHieu: item.kyHieu,
          dinhMuc: item.dinhMuc,
          chiPhiTruocThue: Number(item.chiPhiTruocThue) || 0,
          chiPhiThueVAT: Number(item.chiPhiThueVAT) || 0,
          chiPhiSauThue: Number(item.chiPhiSauThue) || 0,
          cachTinhGiaTri: item.cachTinhGiaTri,
        } as IChiTietDuToan)),
        nhuCauKinhPhi: chiTietData.find((item: any) => item.loaiNhapLieu === 5)?.chiPhiSauThue || 0,
        nguoiNopId: currentUser?.id,
      };

      const response = await requestPOST<IResult<string>>(`KeHoachs`, formData);

      if (response?.data?.succeeded) {
        const fullId = response.data.data;
        const shortCode = fullId?.length > 12 ? fullId.slice(-12).toUpperCase() : fullId;
        setTicketCode(shortCode);
        setStep(3);
      } else {
        message.error(response?.data?.message || "Gửi hồ sơ thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      message.error("Đã có lỗi xảy ra khi gửi hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Tiếp tục (Chuyển sang Bước 2)
  const handleNext = async () => {
    try {
      await form.validateFields();
      const phanLoai = form.getFieldValue('phanLoai');
      if (tableData.length === 0) {
        setSpinning(true);
        try {
          const response = await requestGET<any>(`kehoachs/template/${phanLoai}`);
          if (response?.data) {
            const templateData = response.data.map((item: any) => ({
              ...item,
              isSubHeader: item.stt && String(item.stt).split('.').length < 2,
            }));
            setTableData(templateData);
          }
        } catch (error) {
          console.error('Error fetching template:', error);
          toast.error('Không thể tải mẫu danh mục chi phí!');
        } finally {
          setSpinning(false);
        }
      }
      setStep(2);
    } catch (error) {
      console.log('Validate Step 1 failed:', error);
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

  const steps = [
    { id: 1, title: "Nhập thông tin dự án" },
    { id: 2, title: "Chi tiết dự toán" },
    { id: 3, title: "Hoàn thành" },
  ];

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 w-full">
        {/* Header Tiêu đề & Stepper */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 p-8 shadow-2xs">
          <h1 className="text-2xl lg:text-3xl font-medium text-center text-[#18191c] mb-12">
            Đề xuất dự án CNTT
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

        {/* Nội dung các Bước */}
        <div className="bg-white rounded-b-xl shadow-2xs p-6 lg:p-10 min-h-[500px] border-x border-b border-gray-100">
          <Spin spinning={spinning || loading} tip={loading ? "Đang gửi hồ sơ..." : "Đang tải dữ liệu..."}>
            {/* BƯỚC 1: FORM THÔNG TIN */}
            {step === 1 && (
              <Step1FormThongTin
                form={form}
                onNext={handleNext}
                fileList={fileList}
                setFileList={setFileList}
              />
            )}

            {/* BƯỚC 2: CHI TIẾT DỰ TOÁN */}
            {step === 2 && (
              <Step2DuToan
                phanLoai={form.getFieldValue('phanLoai')}
                hotRef={hotRef}
                tableData={tableData}
                setTableData={setTableData}
                onBack={() => setStep(1)}
                onSubmit={onFinish}
              />
            )}

            {/* BƯỚC 3: HOÀN THÀNH */}
            {step === 3 && (
              <Step3Success ticketCode={ticketCode} copied={copied} setCopied={setCopied} submissionType="it-project" />
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};
