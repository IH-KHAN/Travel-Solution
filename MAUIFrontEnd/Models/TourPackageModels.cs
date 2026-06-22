using System;
using System.Collections.Generic;

namespace MAUIFrontEnd.Models
{
    public class PackageDTO
    {
        public int PackageId { get; set; }
        public string? PackageCode { get; set; }
        public string? PackageTitle { get; set; }
        public string? Description { get; set; }
        public string TargetRegionType { get; set; } = default!;
        public int TargetRegionId { get; set; }
        public int CreatedBy { get; set; }
        public int DurationDays { get; set; }
        public int DurationNight { get; set; }
        public decimal MarkUpAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal PackagePrice { get; set; }
        public int MaxTourist { get; set; }
        public int AvailableVacancy { get; set; }
        public bool IsActive { get; set; }
        public bool IsMarkupPercent { get; set; }
        public bool IsDiscountPercent { get; set; }
        public DateTime CreateAt { get; set; }
        public string? AssignedAgentName { get; set; }
        public int? AssignedAgentId { get; set; }
        public string? AgentName { get; set; }
        public string? AgentEmail { get; set; }
        public decimal? AgentCommission { get; set; }
    }

    public class CompletedPackageDetailDTO
    {
        public int PackageId { get; set; }
        public string PackageCode { get; set; } = string.Empty;
        public string PackageTitle { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int DurationNight { get; set; }
        public decimal PackagePrice { get; set; }
        public string? AgentName { get; set; }
        public string? AgentEmail { get; set; }
        public int TotalTravellers { get; set; }
        public int MaxTourist { get; set; }
        public decimal TotalProjectedCost { get; set; }
        public decimal TotalActualCost { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalMarkup { get; set; }
        public decimal CalculatedProfit { get; set; }
        public List<CompletedActivityDetailDTO> Activities { get; set; } = new();
    }

    public class CompletedActivityDetailDTO
    {
        public int ActivityId { get; set; }
        public string ActivityName { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty;
        public DateTime PlannedTime { get; set; }
        public DateTime? ActualTime { get; set; }
        public decimal ProjectedCost { get; set; }
        public decimal ActualCost { get; set; }
        public decimal CalculatedAgentProjectedCost { get; set; }
        public decimal CalculatedAgentActualCost { get; set; }
        public string? AgentRemarks { get; set; }
        public string? InvoiceImage { get; set; }
    }
}
