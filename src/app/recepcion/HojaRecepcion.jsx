import React from "react";

export default function ChecklistRecepcionSection({ data, setData }) {
  const handleChange = (group, field) => {
    setData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [group]: {
          ...prev.checklist[group],
          [field]: !prev.checklist[group][field]
        }
      }
    }));
  };

  const renderGroup = (title, groupKey) => (
    <div>
      <h3 className="font-bold">{title}</h3>
      {Object.keys(data.checklist[groupKey]).map(item => (
        <label key={item} className="flex gap-2">
          <input
            type="checkbox"
            checked={data.checklist[groupKey][item]}
            onChange={() => handleChange(groupKey, item)}
          />
          {item}
        </label>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {renderGroup("Interior", "interior")}
      {renderGroup("Motor", "motor")}
      {renderGroup("Exterior", "exterior")}
    </div>
  );
}
