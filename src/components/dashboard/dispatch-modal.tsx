"use client";

import React, { useState } from "react";
import { ClipboardCheckIcon, XIcon } from "./icons";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetName: string) => void;
  targetName: string;
  priorityLevel: string;
  isBatch?: boolean;
}

export function DispatchModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  priorityLevel,
  isBatch = false,
}: DispatchModalProps) {
  const [inspector, setInspector] = useState("1");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(targetName);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gov-charcoal/60 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-md border border-gov-border shadow-2xl max-w-lg w-full p-6 md:p-8 transform transition-transform duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gov-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gov-sandlight flex items-center justify-center text-gov-charcoal">
              <ClipboardCheckIcon size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gov-charcoal">
                {isBatch ? "توليد مسار جولة رقابية مجمعة" : "إسناد جولة تفتيشية فورية"}
              </h3>
              <p className="text-xs text-gov-muted">
                {isBatch
                  ? "مسار تفتيش متسلسل للمنشآت الـ 4 ذات الأولوية العالية"
                  : "إصدار أمر مهمة رقابية لمفتش ميداني معتمد"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gov-muted hover:text-gov-charcoal p-1 rounded"
            type="button"
            aria-label="إغلاق"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gov-charcoal mb-1">
              المنشأة المستهدفة:
            </label>
            <input
              type="text"
              readOnly
              value={targetName}
              className="w-full bg-gov-canvas border border-gov-border rounded p-2.5 text-gov-charcoal font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gov-charcoal mb-1">
                المفتش المكلف:
              </label>
              <select
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full bg-white border border-gov-border rounded p-2 text-gov-charcoal"
              >
                <option value="1">م. فهد السحيمي (الفريق الميداني 01)</option>
                <option value="2">أ. خالد الجهني (الفريق الميداني 03)</option>
                <option value="3">م. عبدالرحمن الحربي (الفريق الميداني 04)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gov-charcoal mb-1">
                أولوية التدخل:
              </label>
              <input
                type="text"
                readOnly
                value={priorityLevel}
                className="w-full bg-gov-canvas border border-gov-border rounded p-2 text-risk-critical font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gov-charcoal mb-1">
              محاور التحقق الإلزامية:
            </label>
            <div className="space-y-1.5 p-3 bg-gov-sandlight/40 rounded border border-gov-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gov-emerald focus:ring-0" />
                <span>فحص درجات حرارة التبريد وأجهزة الرصد</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gov-emerald focus:ring-0" />
                <span>سريان الشهادات الصحية للعاملين</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gov-emerald focus:ring-0" />
                <span>التحقق من معالجة مخالفات الزيارة السابقة</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gov-charcoal mb-1">
              ملاحظات التوجيه الرقابي:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gov-border rounded p-2 text-gov-charcoal placeholder-gov-muted focus:outline-none focus:border-gov-emerald"
              placeholder="أدخل أي توجيهات إضافية للمفتش الميداني..."
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gov-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gov-border rounded text-xs font-medium text-gov-charcoal hover:bg-gov-canvas transition"
            type="button"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-gov-charcoal text-white rounded text-xs font-semibold hover:bg-gov-slate transition shadow-sm"
            type="button"
          >
            تأكيد الإسناد وإرسال الإشعار
          </button>
        </div>
      </div>
    </div>
  );
}
