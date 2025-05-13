
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateUserFormProps {
  onCreateUser: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
  }) => Promise<void>;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCreateUser }) => {
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsCreatingUser(true);
    
    try {
      await onCreateUser(userData);
      
      // Reset form
      setUserData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: ""
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          添加用户
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建新用户</DialogTitle>
          <DialogDescription>
            创建一个新的系统用户账号
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              name="email"
              placeholder="user@example.com"
              value={userData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">名</Label>
            <Input
              id="first_name"
              name="first_name"
              value={userData.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">姓</Label>
            <Input
              id="last_name"
              name="last_name"
              value={userData.last_name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">电话</Label>
            <Input
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreatingUser || !userData.email || !userData.password}
          >
            {isCreatingUser ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : "创建用户"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;
