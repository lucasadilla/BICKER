import React from 'react';

export function Select({ value, onValueChange, children, className = '', style = {} }) {
  let options = null;
  React.Children.forEach(children, child => {
    if (child && child.type && child.type.displayName === 'SelectContent') {
      options = child.props.children;
    }
  });
  return (
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className={className}
      style={{ padding: '8px', borderRadius: '4px', ...style }}
    >
      {options}
    </select>
  );
}
Select.displayName = 'Select';

export const SelectTrigger = ({ children }) => <>{children}</>;
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = () => null;
SelectValue.displayName = 'SelectValue';

export const SelectContent = ({ children }) => <>{children}</>;
SelectContent.displayName = 'SelectContent';

export const SelectGroup = ({ children }) => <>{children}</>;
SelectGroup.displayName = 'SelectGroup';

export const SelectLabel = ({ children }) => <>{children}</>;
SelectLabel.displayName = 'SelectLabel';

export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);
SelectItem.displayName = 'SelectItem';
