"use client";

import React, { useState } from "react";
import { useEstatePlan } from "../contexts/EstatePlanContext";

export interface EstatePlanViewerProps {
  isExpanded: boolean;
}

function EstatePlanViewer({ isExpanded }: EstatePlanViewerProps) {
  const { estatePlanData, updateFieldValue, resetEstatePlanData } = useEstatePlan();
  const [activeSection, setActiveSection] = useState<string>("basicInfo");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [newQuestionKey, setNewQuestionKey] = useState<string>("");
  const [newQuestionValue, setNewQuestionValue] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Helper function to get value from a nested path
  const getValueByPath = (obj: any, path: string) => {
    if (!obj) return undefined;
    
    const keys = path.split('.');
    let result = obj;
    
    for (let key of keys) {
      // Handle array indices in the path (format: arrayName[0])
      if (key.includes('[') && key.includes(']')) {
        const arrayKey = key.split('[')[0];
        const index = parseInt(key.split('[')[1].split(']')[0]);
        result = result?.[arrayKey]?.[index];
      } else {
        result = result?.[key];
      }
      
      if (result === undefined) break;
    }
    
    return result;
  };

  // Start editing a field
  const handleEdit = (path: string, currentValue: any) => {
    setEditingField(path);
    setEditValue(currentValue?.toString() || "");
  };

  // Save the edited value
  const handleSave = () => {
    if (editingField) {
      updateFieldValue(editingField, editValue);
      setEditingField(null);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingField(null);
  };

  // Add a new dynamic question/answer pair
  const handleAddDynamicQA = () => {
    if (newQuestionKey && newQuestionValue) {
      updateFieldValue(`dynamicQA.${newQuestionKey}`, newQuestionValue);
      setNewQuestionKey("");
      setNewQuestionValue("");
    }
  };

  // Handle reset button click
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };
  
  // Confirm and execute reset
  const confirmReset = () => {
    resetEstatePlanData();
    setShowResetConfirm(false);
  };
  
  // Cancel reset
  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  // Display a field with edit capability
  const renderField = (label: string, path: string, placeholder = "Not provided") => {
    const value = getValueByPath(estatePlanData, path);
    const isEditing = editingField === path;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {!isEditing && (
            <button 
              onClick={() => handleEdit(path, value)} 
              className="text-blue-500 text-xs hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex ml-2">
              <button 
                onClick={handleSave}
                className="bg-green-500 text-white px-3 py-1 rounded-md text-xs mr-1 hover:bg-green-600 transition-colors"
              >
                Save
              </button>
              <button 
                onClick={handleCancel}
                className="bg-gray-400 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm w-full">
            {value || <span className="text-gray-400">{placeholder}</span>}
          </div>
        )}
      </div>
    );
  };

  // Display a boolean field
  const renderBooleanField = (label: string, path: string) => {
    const value = getValueByPath(estatePlanData, path);
    
    return (
      <div className="mb-3">
        <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
        <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm">
          {value === true ? "Yes" : value === false ? "No" : "Not specified"}
        </div>
      </div>
    );
  };

  // Display a section of related fields
  const renderBasicInfo = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {renderField("Full Name", "basicInfo.fullName")}
          {renderField("Marital Status", "basicInfo.maritalStatus")}
          {renderField("Spouse Name", "basicInfo.spouseName")}
          {renderField("Date of Birth", "basicInfo.dateOfBirth")}
          {renderField("Address", "basicInfo.address")}
        </div>
        <div>
          {renderField("Phone Number", "basicInfo.phoneNumber")}
          {renderField("Email", "basicInfo.email")}
          {renderField("Citizenship", "basicInfo.citizenship")}
          {renderBooleanField("Has Minor Children", "basicInfo.hasMinorChildren")}
          {renderBooleanField("Has Charitable Bequests", "basicInfo.hasCharitableBequests")}
        </div>
      </div>
    );
  };

  const renderMinorChildren = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Children</h3>
          {estatePlanData.minorChildren?.children?.map((child, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
              <div className="flex justify-between">
                <span className="font-medium">{child.name}</span>
                <span>Age: {child.age}</span>
              </div>
              {child.specialNeeds && (
                <div className="mt-1 text-xs bg-yellow-50 p-1 rounded-md border border-yellow-200">
                  Special needs: Yes
                </div>
              )}
            </div>
          ))}
          {(!estatePlanData.minorChildren?.children || estatePlanData.minorChildren.children.length === 0) && (
            <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-400">
              No children added
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderField("Guardian", "minorChildren.guardianName")}
            {renderField("Alternate Guardian", "minorChildren.alternateGuardian")}
          </div>
          <div>
            {estatePlanData.minorChildren?.separatePropertyGuardian && 
              renderField("Property Guardian", "minorChildren.propertyGuardianName")}
            {renderField("Trust Age", "minorChildren.trustAge")}
          </div>
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Trust Details</h3>
          {estatePlanData.minorChildren?.staggeredDistribution && 
            renderField("Distribution Schedule", "minorChildren.staggeredSchedule")}
          {renderField("Trust Details", "minorChildren.trustDetails")}
        </div>
      </div>
    );
  };

  const renderCharitableGiving = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          {renderBooleanField("Wants Charitable Giving", "charitableGiving.wantsCharity")}
          
          {estatePlanData.charitableGiving?.wantsCharity && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Charities</h3>
              {estatePlanData.charitableGiving?.charities?.map((charity, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
                  <div className="font-medium">{charity.name}</div>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                    <div>Amount: {charity.amount}</div>
                    {charity.purposeRestriction && (
                      <div>Purpose: {charity.purposeRestriction}</div>
                    )}
                    {charity.fallbackInstructions && (
                      <div className="col-span-2">Fallback: {charity.fallbackInstructions}</div>
                    )}
                  </div>
                </div>
              ))}
              {(!estatePlanData.charitableGiving?.charities || estatePlanData.charitableGiving.charities.length === 0) && (
                <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-400">
                  No charities added
                </div>
              )}
              
              {renderBooleanField("Charitable Remainder Trust", "charitableGiving.charitableRemainderTrust")}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAssets = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Real Estate</h3>
          {estatePlanData.assets?.realEstate?.map((property, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
              <div className="font-medium">{property.address}</div>
              <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                <div>Value: {property.approximateValue}</div>
                <div>Ownership: {property.ownershipType}</div>
                {property.mortgageBalance && (
                  <div>Mortgage: {property.mortgageBalance}</div>
                )}
              </div>
            </div>
          ))}
          {(!estatePlanData.assets?.realEstate || estatePlanData.assets.realEstate.length === 0) && (
            <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-400">
              No real estate added
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Bank Accounts</h3>
          {estatePlanData.assets?.bankAccounts?.map((account, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
              <div className="font-medium">{account.institution}</div>
              <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                <div>Type: {account.accountType}</div>
                <div>Value: {account.approximateValue}</div>
              </div>
            </div>
          ))}
          {(!estatePlanData.assets?.bankAccounts || estatePlanData.assets.bankAccounts.length === 0) && (
            <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-400">
              No bank accounts added
            </div>
          )}
        </div>
        
        {/* Additional asset sections would be styled similarly */}
      </div>
    );
  };

  const renderExecutorTrustee = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {renderField("Executor", "executorTrustee.executorName")}
          {renderField("Alternate Executor", "executorTrustee.alternatExecutor")}
        </div>
        <div>
          {renderField("Trustee", "executorTrustee.trusteeName")}
          {renderField("Alternate Trustee", "executorTrustee.alternateTrustee")}
        </div>
        
        <div className="col-span-2 bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Powers of Attorney</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Financial POA", "executorTrustee.powersOfAttorney.financialPOA")}
            {renderField("Healthcare POA", "executorTrustee.powersOfAttorney.healthcarePOA")}
          </div>
        </div>
      </div>
    );
  };

  const renderSpecialProvisions = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Pet Provisions</h3>
          {renderBooleanField("Has Pets", "specialProvisions.petProvisions.hasPets")}
          
          {estatePlanData.specialProvisions?.petProvisions?.hasPets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                {renderField("Pet Details", "specialProvisions.petProvisions.petDetails")}
                {renderField("Caregiver", "specialProvisions.petProvisions.caregiverName")}
              </div>
              <div>
                {renderBooleanField("Pet Trust", "specialProvisions.petProvisions.petTrust")}
                {estatePlanData.specialProvisions?.petProvisions?.petTrust && 
                  renderField("Trust Amount", "specialProvisions.petProvisions.petTrustAmount")}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Burial Instructions</h3>
          {renderBooleanField("Has Burial Instructions", "specialProvisions.burialInstructions.hasBurialInstructions")}
          
          {estatePlanData.specialProvisions?.burialInstructions?.hasBurialInstructions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="col-span-2">
                {renderField("Instructions", "specialProvisions.burialInstructions.instructions")}
              </div>
              <div>
                {renderBooleanField("Prepaid Arrangements", "specialProvisions.burialInstructions.prepaidArrangements")}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Other Provisions</h3>
          {renderField("Digital Asset Instructions", "specialProvisions.digitalAssetInstructions")}
          {renderField("Other Special Instructions", "specialProvisions.otherSpecialInstructions")}
        </div>
      </div>
    );
  };
  
  // New section to display dynamic Q&A entries
  const renderDynamicQA = () => {
    // Get all entries from the dynamicQA section if it exists
    const dynamicQA = estatePlanData.dynamicQA || {};
    const hasEntries = Object.keys(dynamicQA).length > 0;
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h3>
          
          {/* Form to add new Q&A pairs */}
          <div className="mb-4 p-3 border border-gray-200 rounded-md bg-blue-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Information</h4>
            <div className="grid grid-cols-1 gap-2">
              <input 
                type="text" 
                placeholder="Question or Category" 
                value={newQuestionKey}
                onChange={(e) => setNewQuestionKey(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea 
                placeholder="Answer or Information" 
                value={newQuestionValue}
                onChange={(e) => setNewQuestionValue(e.target.value)}
                rows={2}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddDynamicQA}
                disabled={!newQuestionKey || !newQuestionValue}
                className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Information
              </button>
            </div>
          </div>
          
          {/* Display existing Q&A pairs */}
          {hasEntries ? (
            <div className="space-y-3">
              {Object.entries(dynamicQA).map(([key, value], index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  {renderField(key, `dynamicQA.${key}`, "Not provided")}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-400">
              No additional information added yet
            </div>
          )}
        </div>
      </div>
    );
  };

  // Define the sections and their content
  const sections = [
    { id: "basicInfo", label: "Basic Info", content: renderBasicInfo() },
    { id: "minorChildren", label: "Minor Children", content: renderMinorChildren() },
    { id: "charitableGiving", label: "Charitable Giving", content: renderCharitableGiving() },
    { id: "assets", label: "Assets", content: renderAssets() },
    { id: "executorTrustee", label: "Executor & Trustee", content: renderExecutorTrustee() },
    { id: "specialProvisions", label: "Special Provisions", content: renderSpecialProvisions() },
    { id: "dynamicQA", label: "Additional Q&A", content: renderDynamicQA() }
  ];

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">      
      <div className="flex border-b bg-gray-50 overflow-x-auto justify-between">
        <div className="flex overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSection === section.id
                  ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        <div className="flex-shrink-0 pr-2">
          <button 
            onClick={handleResetClick}
            className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
          >
            Reset Data
          </button>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-grow">
        {/* Reset confirmation modal */}
        {showResetConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white p-4 rounded-md shadow-lg max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Estate Plan Data?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will delete all estate plan data. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelReset}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
        
        {sections.find(section => section.id === activeSection)?.content}
      </div>
    </div>
  );
}

export default EstatePlanViewer; 