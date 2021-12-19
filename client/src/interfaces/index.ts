// interfaces
export interface myForm {
  children: React.ReactNode,
}

export interface MyRegisterFormValues {
  regFname: string,
  regLname:string,
  regEmail:string,
  regStatus:string,
  regNumber:string,
  regPass:string,
  repeatRegPass:string,
}

export interface MyLoginFormValues {
  loginEmail: string,
  loginPass:string,
}

export interface MyInputFormProps {
  text: string, 
  type: string, 
  id: string, 
  name: string, 
  onChange?: any, 
  onBlur?: any, 
  value: string,
}

export interface MySingleSelectProps{
  id: string,
  name: string,
  onChange?: any, 
  onBlur?: any, 
  value: string,
}

export interface MyButtonProps {
  className?: string,
  text: string, 
  type: "button" | "submit" | "reset" | undefined, 
  name: string, 
  onClick?: () => void,
}