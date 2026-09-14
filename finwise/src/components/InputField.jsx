function InputField({
  id,
  type = "text",
  placeholder,
  value,
  onChange
}) {
  return (
    <input
      id={id}
      className="input-field"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export default InputField;