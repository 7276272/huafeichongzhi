
import React, { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onResend: () => void;
  isResending: boolean;
  maxLength?: number;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  onResend,
  isResending,
  maxLength = 6,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (countdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleResend = () => {
    if (!isResending && (!countdown || countdown === 0)) {
      onResend();
      setCountdown(60); // Start a 60-second countdown
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <InputOTP
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        pattern="[0-9]*"
        inputMode="numeric"
        className="gap-2"
        containerClassName="justify-center"
      >
        <InputOTPGroup>
          {Array.from({ length: maxLength }).map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                "w-10 h-12 border-border",
                "focus-visible:ring-primary focus-visible:border-primary"
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleResend}
        disabled={isResending || (countdown && countdown > 0)}
        className={cn(
          "text-sm flex items-center gap-2",
          (isResending || (countdown && countdown > 0)) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isResending ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            发送中...
          </>
        ) : countdown && countdown > 0 ? (
          `${countdown}秒后可重新发送`
        ) : (
          "重新发送验证码"
        )}
      </Button>
    </div>
  );
};

export default VerificationCodeInput;
