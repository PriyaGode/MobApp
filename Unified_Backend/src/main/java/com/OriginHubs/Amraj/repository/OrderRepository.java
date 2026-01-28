package com.OriginHubs.Amraj.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.dto.OrderSummaryDto;
import com.OriginHubs.Amraj.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

	@Query(value = """
			select new com.OriginHubs.Amraj.dto.OrderSummaryDto(
					o.id,
					u.fullName,
					h.name,
					dp.name,
					o.status,
					o.createdAt,
					o.issueFlag,
					o.totalAmount
			)
			from Order o
			left join o.customer u
			left join o.hub h
			left join o.deliveryPartner dp
			where (:status is null or o.status = :status)
				and (:hubId is null or h.id = :hubId)
				and (:deliveryPartnerId is null or dp.id = :deliveryPartnerId)
				and (:issue is null or o.issueFlag = :issue)
			""",
			countQuery = """
			select count(o)
			from Order o
			left join o.customer u
			left join o.hub h
			left join o.deliveryPartner dp
			where (:status is null or o.status = :status)
				and (:hubId is null or h.id = :hubId)
				and (:deliveryPartnerId is null or dp.id = :deliveryPartnerId)
				and (:issue is null or o.issueFlag = :issue)
			"""
	)
	Page<OrderSummaryDto> findSummaries(
			@Param("status") String status,
			@Param("hubId") UUID hubId,
			@Param("deliveryPartnerId") Long deliveryPartnerId,
			@Param("issue") Boolean issue,
			Pageable pageable
	);

	/**
	 * EntityGraph powered version of findAll(spec,pageable) to reduce N+1 selects for
	 * customer, hub and deliveryPartner while excluding heavy collections like orderItems.
	 */
	@EntityGraph(attributePaths = {"customer", "hub", "deliveryPartner"})
	Page<Order> findAll(org.springframework.data.jpa.domain.Specification<Order> spec, Pageable pageable);

	/**
	 * Fetch an Order with its associated collections/entities required for details view
	 * to avoid LazyInitializationException when mapping to DTO outside of a session.
	 */
	@Query("""
		select o
		from Order o
		left join fetch o.orderItems oi
		left join fetch oi.product p
		left join fetch o.customer c
		left join fetch o.hub h
		left join fetch o.deliveryPartner dp
		where o.id = :id
	""")
	Optional<Order> findByIdWithDetails(@Param("id") Long id);

	Long countByCreatedAtBetween(java.time.OffsetDateTime start, java.time.OffsetDateTime end);

	@Query("""
		SELECT h.id, h.name, h.location, COUNT(o.id), COALESCE(SUM(o.totalAmount), 0), COALESCE(h.rating, 0)
		FROM Order o
		JOIN o.hub h
		WHERE o.createdAt >= :startDate
		GROUP BY h.id, h.name, h.location, h.rating
		ORDER BY COUNT(o.id) DESC
	""")
	List<Object[]> findTopHubsByOrderCount(@Param("startDate") java.time.OffsetDateTime startDate, Pageable pageable);

	// Customer portal methods
	@Query("SELECT o FROM Order o WHERE o.customer = :user ORDER BY o.createdAt DESC")
	List<Order> findByUserOrderByCreatedAtDesc(@Param("user") com.OriginHubs.Amraj.model.User user);

	@Query("SELECT o FROM Order o LEFT JOIN FETCH o.customer LEFT JOIN FETCH o.orderItems WHERE o.customer.id = :userId ORDER BY o.createdAt DESC")
	List<Order> findByCustomerIdOrderByCreatedAtDesc(@Param("userId") Long userId);

	boolean existsByCustomerIdAndPromoCode(Long customerId, String promoCode);
}
