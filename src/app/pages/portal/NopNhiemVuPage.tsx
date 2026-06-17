

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/modules/auth";
import { Form } from "antd";

import { Step1TaskSelection } from "./components/nop-nhiem-vu/Step1TaskSelection";
import { Step2FormDeTai } from "./components/nop-nhiem-vu/Step2FormDeTai";
import { Step2FormSXTN } from "./components/nop-nhiem-vu/Step2FormSXTN";
import { Step2FormKHCN } from "./components/nop-nhiem-vu/Step2FormKHCN";
import { Step3Success } from "./components/nop-nhiem-vu/Step3Success";

export const NopNhiemVuPage = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [taskType, setTaskType] = useState<number | null>(1);
  const [ticketCode, setTicketCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  // Xử lý Gửi hồ sơ
  const onFinish = (values: any) => {
    console.log("Form values:", values);
    // Giả lập lưu hồ sơ thành công & tạo mã
    const code = `NV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketCode(code);
    setStep(3);
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
    { id: 1, title: "Chọn loại nhiệm vụ" },
    { id: 2, title: "Nhập thông tin đề xuất" },
    { id: 3, title: "Hoàn thành" },
  ];

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 w-full">
        {/* Header Tiêu đề & Stepper */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 p-8 shadow-2xs">
          <h1 className="text-2xl lg:text-3xl font-medium text-center text-[#18191c] mb-12">
            Đề xuất đặt hàng nhiệm vụ KH&CN
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

          {/* BƯỚC 1: CHỌN LOẠI */}
          {step === 1 && (
            <Step1TaskSelection taskType={taskType} setTaskType={setTaskType} setStep={setStep} />
          )}

          {/* BƯỚC 2: FORM NHẬP */}
          {step === 2 && taskType === 1 && (
            <Step2FormDeTai form={form} onFinish={onFinish} setStep={setStep} currentUser={currentUser} />
          )}

          {step === 2 && taskType === 2 && (
            <Step2FormSXTN form={form} onFinish={onFinish} setStep={setStep} currentUser={currentUser} />
          )}

          {step === 2 && taskType === 3 && (
            <Step2FormKHCN form={form} onFinish={onFinish} setStep={setStep} currentUser={currentUser} />
          )}

          {/* BƯỚC 3: THÀNH CÔNG */}
          {step === 3 && (
            <Step3Success ticketCode={ticketCode} copied={copied} setCopied={setCopied} submissionType="research" />
          )}

        </div>
      </div>
    </div>
  );
};
